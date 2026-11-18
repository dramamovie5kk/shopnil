import { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "@/integrations/cloudflare/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface CourierData {
  name: string;
  logo: string;
  total_parcel: number;
  success_parcel: number | string;
  cancelled_parcel: number | string;
  success_ratio: number;
}

interface CourierRatioData {
  couriers: CourierData[];
  summary: {
    total_parcel: number;
    success_parcel: number;
    cancelled_parcel: number;
    success_ratio: number;
  };
  checked_at?: string;
}

interface CourierRatioCheckerProps {
  phone: string;
  orderId?: string;
  cachedData?: any;
  saveToDb?: boolean;
}

const CourierRatioChecker = ({ phone, orderId, cachedData, saveToDb = true }: CourierRatioCheckerProps) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CourierRatioData | null>(
    cachedData?.summary ? cachedData : null
  );
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const hasFetched = useRef(!!cachedData?.summary);

  // If cachedData arrives later (e.g. async query), use it
  useEffect(() => {
    if (!hasFetched.current && !data && cachedData?.summary) {
      setData(cachedData);
      hasFetched.current = true;
    }
  }, [cachedData]);

  // No auto-fetch - manual button only

  const fetchRatio = async (forceRefresh = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    hasFetched.current = true;
    
    try {
      const { data: result, error: fnError } = await api.functions.invoke('check-courier-ratio', {
        body: { phone },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      const apiData = result.data;
      
      // Parse courier-wise data
      const courierKeys = ['pathao', 'steadfast', 'parceldex', 'redx', 'paperfly', 'carrybee'];
      const couriers: CourierData[] = courierKeys
        .filter(key => apiData[key])
        .map(key => ({
          name: apiData[key].name,
          logo: apiData[key].logo,
          total_parcel: Number(apiData[key].total_parcel) || 0,
          success_parcel: Number(apiData[key].success_parcel) || 0,
          cancelled_parcel: Number(apiData[key].cancelled_parcel) || 0,
          success_ratio: Number(apiData[key].success_ratio) || 0,
        }));

      const summary = apiData.summary || {
        total_parcel: 0,
        success_parcel: 0,
        cancelled_parcel: 0,
        success_ratio: 0,
      };

      const ratioData: CourierRatioData = {
        couriers,
        summary: {
          total_parcel: Number(summary.total_parcel) || 0,
          success_parcel: Number(summary.success_parcel) || 0,
          cancelled_parcel: Number(summary.cancelled_parcel) || 0,
          success_ratio: Number(summary.success_ratio) || 0,
        },
        checked_at: new Date().toISOString(),
      };

      setData(ratioData);

      // Save to database for caching (only for orders, and only if we got real data)
      if (saveToDb && orderId && ratioData.summary.total_parcel > 0) {
        await api
          .from("orders")
          .update({ courier_ratio_data: ratioData as any })
          .eq("id", orderId);
      }

    } catch (err: any) {
      console.error('Error checking courier ratio:', err);
      setError(err.message || 'চেক করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // Determine color based on success ratio
  const getColor = (ratio: number, total: number) => {
    if (total === 0) return "text-muted-foreground";
    if (ratio >= 70) return "text-green-600";
    if (ratio >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">চেক হচ্ছে...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="flex items-center gap-1 text-xs text-destructive" title={error}>
          <AlertCircle className="h-3 w-3" />
          Error
        </span>
        <button 
          onClick={() => fetchRatio(true)}
          className="text-[10px] text-primary hover:underline"
        >
          আবার চেষ্টা
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <button
        onClick={() => fetchRatio()}
        className="text-xs text-primary hover:underline whitespace-nowrap"
      >
        চেক করুন
      </button>
    );
  }

  const successRatio = data.summary.success_ratio;
  const total = data.summary.total_parcel;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="flex flex-col items-center gap-0.5">
        <span className={`text-sm font-bold ${getColor(successRatio, total)}`}>
          {total === 0 ? "নতুন" : `${Math.round(successRatio)}%`}
        </span>
        <DialogTrigger asChild>
          <button className="text-[10px] text-primary hover:underline cursor-pointer">
            ডিটেইলস দেখুন
          </button>
        </DialogTrigger>
      </div>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            কুরিয়ার রেসিও
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => fetchRatio(true)}
              disabled={loading}
              className="h-6 w-6 p-0"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                <TableHead className="text-primary-foreground font-semibold">COURIER</TableHead>
                <TableHead className="text-center text-primary-foreground font-semibold">TOTAL</TableHead>
                <TableHead className="text-center text-primary-foreground font-semibold">SUCCESS</TableHead>
                <TableHead className="text-center text-primary-foreground font-semibold">CANCEL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.couriers.map((courier, index) => (
                <TableRow key={index}>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <img 
                        src={courier.logo} 
                        alt={courier.name} 
                        className="h-6 w-auto object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="text-xs text-muted-foreground">{courier.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">{courier.total_parcel}</TableCell>
                  <TableCell className="text-center font-medium text-green-600">{courier.success_parcel}</TableCell>
                  <TableCell className="text-center font-medium text-red-600">{courier.cancelled_parcel}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted font-bold">
                <TableCell className="py-2">
                  <span className="font-semibold">Total</span>
                </TableCell>
                <TableCell className="text-center font-bold">{data.summary.total_parcel}</TableCell>
                <TableCell className="text-center font-bold text-green-600">{data.summary.success_parcel}</TableCell>
                <TableCell className="text-center font-bold text-red-600">{data.summary.cancelled_parcel}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {data.checked_at && (
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              শেষ চেক: {new Date(data.checked_at).toLocaleString("bn-BD")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourierRatioChecker;
