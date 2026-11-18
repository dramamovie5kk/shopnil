import { MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DuplicateOrderBlockAlertProps {
  message: string;
  whatsappNumber: string;
  productName?: string;
}

const DuplicateOrderBlockAlert = ({
  message,
  whatsappNumber,
  productName,
}: DuplicateOrderBlockAlertProps) => {
  const handleWhatsAppClick = () => {
    if (whatsappNumber) {
      const cleanNumber = whatsappNumber.replace(/\D/g, "");
      let waMessage = "হ্যালো, আমি অর্ডার করতে চাই।";
      if (productName) {
        waMessage = `হ্যালো, আমি "${productName}" প্রোডাক্টটি অর্ডার করতে চাই।`;
      }
      window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(waMessage)}`, "_blank");
    }
  };

  return (
    <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
      <AlertTitle className="text-orange-800 dark:text-orange-200 font-semibold text-center text-lg">
        অপেক্ষা করুন
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-orange-700 dark:text-orange-300">{message}</p>

        {whatsappNumber && (
          <Button
            type="button"
            variant="outline"
            className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp এ অর্ডার করুন
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default DuplicateOrderBlockAlert;
