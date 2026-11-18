import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { X, Gift, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/integrations/cloudflare/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import SpinWheelCanvas from "./SpinWheelCanvas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SpinOffer {
  id: string;
  offer_text: string;
  discount_type: string;
  discount_value: number;
  color: string;
  text_color: string;
  probability: number;
  icon?: string;
}

type SpinStep = "form" | "spinning" | "result";

const SPIN_STORAGE_KEY = "spin_last_shown";

const SpinWheel = () => {
  const location = useLocation();
  const { getSetting, isLoading: settingsLoading } = useSiteSettings();

  const [show, setShow] = useState(false);
  const [step, setStep] = useState<SpinStep>("form");
  const [offers, setOffers] = useState<SpinOffer[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [wonOffer, setWonOffer] = useState<SpinOffer | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Excluded pages
  const excludedPaths = ["/checkout", "/order-success", "/lp-order-success", "/admin"];
  const isExcluded = excludedPaths.some((p) => location.pathname.startsWith(p));

  // Check if already shown today
  const hasShownToday = useCallback(() => {
    try {
      const lastShown = localStorage.getItem(SPIN_STORAGE_KEY);
      if (!lastShown) return false;
      const today = new Date().toDateString();
      return lastShown === today;
    } catch {
      return false;
    }
  }, []);

  // Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      const { data } = await api
        .from("spin_offers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (data && data.length > 0) {
        setOffers(data as SpinOffer[]);
      }
    };
    fetchOffers();
  }, []);

  // Timer to show popup
  useEffect(() => {
    if (isExcluded || settingsLoading) return;

    const spinEnabled = getSetting("spin_enabled", "false");
    if (spinEnabled !== "true") return;
    if (hasShownToday()) return;
    if (offers.length === 0) return;

    const delay = parseInt(getSetting("spin_delay_seconds", "25")) * 1000;
    const timer = setTimeout(() => {
      if (!hasShownToday()) {
        setShow(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isExcluded, settingsLoading, getSetting, hasShownToday, offers.length, location.pathname]);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem(SPIN_STORAGE_KEY, new Date().toDateString());
  };

  const handleStartSpin = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("নাম ও ফোন নম্বর দিন");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("সঠিক ফোন নম্বর দিন");
      return;
    }
    const { data, error } = await api.rpc("spin", { name: name.trim(), phone: phone.trim() });
    if (error) { toast.error(error.message); return; }
    const index = offers.findIndex(o => o.id === data.offer.id);
    if (index < 0) { toast.error("অফার পরিবর্তন হয়েছে। পেজ রিফ্রেশ করুন।"); return; }
    setWonOffer(data.offer);
    setCouponCode(data.coupon_code);
    setWinnerIndex(index);
    setStep("spinning");
    setIsSpinning(true);
  };

  const handleSpinEnd = () => {
    localStorage.setItem(SPIN_STORAGE_KEY, new Date().toDateString());
    setStep("result");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    toast.success("কুপন কোড কপি হয়েছে!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!show || offers.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={(e) => e.target === e.currentTarget && step !== "spinning" && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative w-full max-w-sm rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          style={{
            background: "linear-gradient(180deg, #0a3d2a 0%, #0d5c3b 50%, #10b981 100%)",
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/50 transition-colors"
            disabled={isSpinning}
          >
            <X className="h-5 w-5" />
          </button>

          {step === "form" && (
            <div className="p-4 pt-8">
              {/* Wheel */}
              <div className="flex justify-center my-3">
                <SpinWheelCanvas winnerIndex={winnerIndex}
                  offers={offers}
                  onSpinEnd={() => {}}
                  isSpinning={false}
                  setIsSpinning={() => {}}
                />
              </div>

              {/* Badge */}
              <div className="text-center mb-3">
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <Gift className="h-4 w-4 text-yellow-300" />
                  বিশেষ অফার
                </span>
              </div>

              {/* Title */}
              <h2 className="text-center text-xl font-bold text-white mb-1">
                SPIN করুন ডিস্কাউন্ট জিতুন
              </h2>
              <p className="text-center text-white/70 text-sm mb-4">
                আপনার তথ্য দিন এবং চান্স পান পুরস্কার জেতার!
              </p>

              {/* Form */}
              <div className="space-y-2.5 bg-white rounded-xl p-3">
                <div>
                  <label className="text-sm font-bold text-gray-800 mb-1 block">আপনার নাম*</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার পুরো নাম লিখুন"
                    className="h-11 bg-gray-50 border-gray-200 text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-800 mb-1 block">ফোন নাম্বার*</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="h-11 bg-gray-50 border-gray-200 text-gray-900"
                  />
                </div>
                <Button
                  onClick={handleStartSpin}
                  className="w-full h-12 text-base font-bold rounded-xl text-white"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                  }}
                >
                  ✦ আপনি হবেন বিজয়ী!
                </Button>
              </div>
            </div>
          )}

          {step === "spinning" && (
            <div className="p-4 pt-8">
              <h2 className="text-center text-xl font-bold text-white mb-3">
                🎯 স্পিন চলছে...
              </h2>
              <div className="flex justify-center my-3">
                <SpinWheelCanvas winnerIndex={winnerIndex}
                  offers={offers}
                  onSpinEnd={handleSpinEnd}
                  isSpinning={isSpinning}
                  setIsSpinning={setIsSpinning}
                />
              </div>
              <p className="text-center text-white/70 text-sm">
                অপেক্ষা করুন...
              </p>
            </div>
          )}

          {step === "result" && wonOffer && (
            <div className="p-5 pt-8 text-center">
              {/* Celebration */}
              <div className="text-5xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-1">অভিনন্দন!</h2>
              <p className="text-yellow-300 font-medium mb-4">
                ফলাফল, আপনি জিতেছেন!
              </p>

              {/* Prize card */}
              <div className="bg-white rounded-2xl p-6 mb-4">
                <div className="text-4xl mb-2">🎁</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {wonOffer.offer_text}
                </h3>

                {/* Coupon code box */}
                <div
                  className="rounded-xl p-4 mb-3"
                  style={{
                    border: "2px dashed #10b981",
                    background: "#f0fdf4",
                  }}
                >
                  <p className="text-xs text-gray-500 mb-1">কুপন কোড</p>
                  <p className="text-2xl font-bold tracking-wider" style={{ color: "#059669" }}>
                    {couponCode}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ছাড়: {wonOffer.discount_type === "percentage"
                      ? `${wonOffer.discount_value}%`
                      : `৳${wonOffer.discount_value}`}
                  </p>
                </div>

                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="w-full h-10 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  {copied ? (
                    <><Check className="h-4 w-4 mr-2" /> কপি হয়েছে</>
                  ) : (
                    <><Copy className="h-4 w-4 mr-2" /> কুপন কপি করুন</>
                  )}
                </Button>

                <p className="text-xs text-gray-400 mt-3">
                  ফোন নাম্বার: {phone}
                </p>
              </div>

              <Button
                onClick={handleClose}
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white px-8"
              >
                বন্ধ করুন
              </Button>

              <p className="text-xs text-white/60 mt-3">
                পছন্দের যে কোনো প্রোডাক্ট অর্ডার করুন এবং অফারটি লুফে নিন 💛
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SpinWheel;
