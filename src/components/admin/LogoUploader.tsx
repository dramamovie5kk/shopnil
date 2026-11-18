import { useState, useRef } from "react";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";

interface LogoUploaderProps {
  currentLogoUrl: string;
  onLogoChange: (url: string) => void;
}

const LogoUploader = ({ currentLogoUrl, onLogoChange }: LogoUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("শুধুমাত্র ইমেজ ফাইল আপলোড করা যাবে");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("ফাইল সাইজ ২MB এর কম হতে হবে");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `site/${fileName}`;

      const { error: uploadError } = await api.storage
        .from("products")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = api.storage
        .from("products")
        .getPublicUrl(filePath);

      onLogoChange(urlData.publicUrl);
      toast.success("লোগো আপলোড সফল!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("আপলোড ব্যর্থ: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>লোগো ইমেজ</Label>
      
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted overflow-hidden">
          {currentLogoUrl ? (
            <img 
              src={currentLogoUrl} 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          )}
        </div>

        {/* Upload controls */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                আপলোড হচ্ছে...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                লোগো আপলোড করুন
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            PNG, JPG, SVG (সর্বোচ্চ ২MB)
          </p>

          {currentLogoUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onLogoChange("")}
              className="text-destructive hover:text-destructive"
            >
              লোগো সরান
            </Button>
          )}
        </div>
      </div>

      {/* URL input as fallback */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">অথবা URL দিন</Label>
        <Input
          value={currentLogoUrl}
          onChange={(e) => onLogoChange(e.target.value)}
          placeholder="https://example.com/logo.png"
          className="text-sm"
        />
      </div>
    </div>
  );
};

export default LogoUploader;
