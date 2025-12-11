import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crop as CropIcon, RotateCcw, Check, X, FileImage } from 'lucide-react';

interface ImageCropperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  fileName: string;
  fileSize: number;
  onCropComplete: (croppedImageBase64: string) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' octets';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
  return (bytes / (1024 * 1024)).toFixed(2) + ' Mo';
}

function getSizeColor(bytes: number): string {
  if (bytes < 500 * 1024) return 'bg-green-500/10 text-green-600 border-green-500/20';
  if (bytes < 1.5 * 1024 * 1024) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
  return 'bg-red-500/10 text-red-600 border-red-500/20';
}

export function ImageCropperDialog({
  open,
  onOpenChange,
  imageSrc,
  fileName,
  fileSize,
  onCropComplete,
}: ImageCropperDialogProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [croppedSize, setCroppedSize] = useState<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const resetCrop = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, 1));
    }
  };

  // Calculate cropped image size estimate
  useEffect(() => {
    if (completedCrop && imgRef.current) {
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;
      
      // Rough estimate based on pixel count ratio
      const originalPixels = image.naturalWidth * image.naturalHeight;
      const croppedPixels = cropWidth * cropHeight;
      const estimatedSize = (croppedPixels / originalPixels) * fileSize;
      
      setCroppedSize(Math.round(estimatedSize));
    }
  }, [completedCrop, fileSize]);

  const getCroppedImage = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!completedCrop || !imgRef.current) {
        reject(new Error('No crop data'));
        return;
      }

      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const pixelRatio = window.devicePixelRatio;
      
      // Set output size to 256x256 for profile pictures
      const outputSize = 256;
      canvas.width = outputSize * pixelRatio;
      canvas.height = outputSize * pixelRatio;

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        outputSize,
        outputSize,
      );

      // Convert to base64 with quality compression
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      resolve(base64);
    });
  }, [completedCrop]);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImage();
      onCropComplete(croppedImage);
      onOpenChange(false);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5 text-primary" />
            Recadrer la photo
          </DialogTitle>
          <DialogDescription>
            Ajustez le cadrage de votre photo de profil
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File info */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileImage className="h-4 w-4" />
              <span className="truncate max-w-[150px]">{fileName}</span>
            </div>
            <Badge variant="outline" className={getSizeColor(fileSize)}>
              Original: {formatFileSize(fileSize)}
            </Badge>
            {croppedSize > 0 && (
              <Badge variant="outline" className={getSizeColor(croppedSize)}>
                Après recadrage: ~{formatFileSize(croppedSize)}
              </Badge>
            )}
          </div>

          {/* Cropper */}
          <div className="flex items-center justify-center bg-muted/30 rounded-lg p-2 min-h-[300px]">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
              className="max-h-[300px]"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Image à recadrer"
                onLoad={onImageLoad}
                className="max-h-[300px] max-w-full object-contain"
              />
            </ReactCrop>
          </div>

          {/* Size warning */}
          {fileSize > 1.5 * 1024 * 1024 && (
            <p className="text-xs text-yellow-600 bg-yellow-500/10 border border-yellow-500/20 rounded-md p-2">
              ⚠️ L'image est volumineuse. Elle sera compressée automatiquement lors de l'enregistrement.
            </p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={resetCrop} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </Button>
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!completedCrop}>
              <Check className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
