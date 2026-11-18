import { useId, useState } from "react";
import { Plus, X, Loader2, GripVertical, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/integrations/cloudflare/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GalleryImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  inputId?: string;
  label?: string;
  uploadText?: string;
}

const GalleryImageUploader = ({
  images,
  onChange,
  maxImages = 10,
  inputId,
  label = "গ্যালারি ইমেজ",
  uploadText = "গ্যালারিতে ছবি যোগ করুন",
}: GalleryImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const autoId = useId();
  const fileInputId = inputId || `gallery-upload-${autoId}`;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`সর্বোচ্চ ${maxImages}টি ছবি আপলোড করতে পারবেন`);
      return;
    }

    setUploading(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/gallery/${fileName}`;

        const { error: uploadError } = await api.storage
          .from("products")
          .upload(filePath, file);

        if (uploadError) {
          toast.error(`ইমেজ আপলোড ব্যর্থ: ${file.name}`);
          continue;
        }

        const {
          data: { publicUrl },
        } = api.storage.from("products").getPublicUrl(filePath);

        newImages.push(publicUrl);
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
        toast.success(`${newImages.length}টি ছবি আপলোড হয়েছে`);
      }
    } catch (error) {
      toast.error("আপলোডে সমস্যা হয়েছে");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    onChange(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-xs text-muted-foreground">
          {images.length}/{maxImages}টি ছবি
        </span>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {images.map((url, index) => (
            <div
              key={url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative group aspect-square rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing",
                draggedIndex === index
                  ? "border-primary opacity-50"
                  : "border-transparent hover:border-primary/50"
              )}
            >
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <div className="p-1 bg-white/90 rounded">
                    <GripVertical className="h-4 w-4 text-gray-600" />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemove(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                  প্রধান
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            id={fileInputId}
            disabled={uploading}
          />
          <Label
            htmlFor={fileInputId}
            className={cn(
              "flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
              "hover:bg-secondary/50 hover:border-primary/50",
              uploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  আপলোড হচ্ছে...
                </span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
                 <span className="text-sm text-muted-foreground">
                   {uploadText}
                 </span>
                 <span className="text-xs text-muted-foreground">
                   একাধিক ছবি সিলেক্ট করতে পারবেন • ড্র্যাগ করে ক্রম পরিবর্তন করুন
                 </span>
                 <span className="text-[10px] text-muted-foreground opacity-70">
                   রিকমেন্ডেড: 600×600px
                 </span>
              </>
            )}
          </Label>
        </div>
      )}

      {images.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          প্রোডাক্ট পেজে একাধিক ছবি দেখাতে এখানে আপলোড করুন
        </p>
      )}
    </div>
  );
};

export default GalleryImageUploader;
