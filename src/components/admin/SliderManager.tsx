import { useState, useRef } from "react";
import { Plus, Trash2, Upload, Loader2, GripVertical, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface SliderImage {
  id: string;
  url: string;
  link?: string;
}

interface SliderManagerProps {
  sliderImages: SliderImage[];
  onImagesChange: (images: SliderImage[]) => void;
  isFullWidth: boolean;
  onFullWidthChange: (value: boolean) => void;
  heightMobile: string;
  onHeightMobileChange: (value: string) => void;
  heightDesktop: string;
  onHeightDesktopChange: (value: string) => void;
}

const SliderManager = ({ sliderImages, onImagesChange, isFullWidth, onFullWidthChange, heightMobile, onHeightMobileChange, heightDesktop, onHeightDesktopChange }: SliderManagerProps) => {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: SliderImage[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `slider-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `sliders/${fileName}`;

        const { error: uploadError } = await api.storage
          .from("products")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = api.storage
          .from("products")
          .getPublicUrl(filePath);

        newImages.push({
          id: crypto.randomUUID(),
          url: urlData.publicUrl,
          link: "",
        });
      }

      onImagesChange([...sliderImages, ...newImages]);
      toast.success(`${newImages.length}টি ইমেজ আপলোড হয়েছে`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("ইমেজ আপলোড করতে সমস্যা হয়েছে");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = sliderImages[index];
    
    // Try to delete from storage
    try {
      const url = new URL(imageToRemove.url);
      const pathMatch = url.pathname.match(/\/api\/media\/products\/(.+)/);
      if (pathMatch) {
        await api.storage.from("products").remove([decodeURIComponent(pathMatch[1])]);
      }
    } catch (error) {
      console.error("Error deleting file from storage:", error);
    }

    const newImages = sliderImages.filter((_, i) => i !== index);
    onImagesChange(newImages);
    toast.success("ইমেজ মুছে ফেলা হয়েছে");
  };

  const handleLinkChange = (index: number, link: string) => {
    const newImages = [...sliderImages];
    newImages[index] = { ...newImages[index], link };
    onImagesChange(newImages);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...sliderImages];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    onImagesChange(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          🖼️ স্লাইডার ইমেজ
        </CardTitle>
        <CardDescription>
          হোমপেজে প্রদর্শিত স্লাইডার ইমেজ যোগ/পরিবর্তন করুন। ড্র্যাগ করে ক্রম পরিবর্তন করতে পারেন।
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Full Width Toggle */}
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
          <div className="space-y-0.5">
            <Label htmlFor="full-width-toggle" className="text-sm font-medium">
              ফুল-উইথ স্লাইডার
            </Label>
            <p className="text-xs text-muted-foreground">
              স্লাইডারকে পুরো স্ক্রিন জুড়ে দেখাতে চাইলে অন করুন
            </p>
          </div>
          <Switch
            id="full-width-toggle"
            checked={isFullWidth}
            onCheckedChange={onFullWidthChange}
          />
        </div>

        {/* Height Settings */}
        <div className="grid grid-cols-2 gap-4 p-3 border rounded-lg bg-muted/50">
          <div className="space-y-1.5">
            <Label htmlFor="slider-height-mobile" className="text-sm font-medium">
              মোবাইল হাইট (px)
            </Label>
            <Input
              id="slider-height-mobile"
              type="number"
              value={heightMobile}
              onChange={(e) => onHeightMobileChange(e.target.value)}
              placeholder="180"
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slider-height-desktop" className="text-sm font-medium">
              ডেস্কটপ হাইট (px)
            </Label>
            <Input
              id="slider-height-desktop"
              type="number"
              value={heightDesktop}
              onChange={(e) => onHeightDesktopChange(e.target.value)}
              placeholder="450"
              className="h-8"
            />
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            ইমেজ যোগ করুন
          </Button>
          <span className="text-sm text-muted-foreground">
            প্রস্তাবিত সাইজ: 1920x500px
          </span>
        </div>

        {/* Image List */}
        {sliderImages.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
            <Upload className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>কোনো স্লাইডার ইমেজ নেই</p>
            <p className="text-sm">উপরের বাটনে ক্লিক করে ইমেজ যোগ করুন</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sliderImages.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-3 border rounded-lg bg-card transition-all ${
                  draggedIndex === index ? "opacity-50 scale-95" : ""
                }`}
              >
                {/* Drag Handle */}
                <div className="cursor-grab text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-5 w-5" />
                </div>

                {/* Thumbnail */}
                <div className="w-24 h-14 rounded overflow-hidden flex-shrink-0 bg-secondary">
                  <img
                    src={image.url}
                    alt={`Slider ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Link Input */}
                <div className="flex-1 min-w-0">
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    ক্লিক লিংক (ঐচ্ছিক)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={image.link || ""}
                      onChange={(e) => handleLinkChange(index, e.target.value)}
                      placeholder="/products অথবা /lp/your-page"
                      className="h-8 text-sm"
                    />
                    {image.link && (
                      <a
                        href={image.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveImage(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {sliderImages.length > 0 && (
          <p className="text-xs text-muted-foreground">
            মোট {sliderImages.length}টি স্লাইড। সেভ করতে নিচের "সংরক্ষণ করুন" বাটন ক্লিক করুন।
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SliderManager;
