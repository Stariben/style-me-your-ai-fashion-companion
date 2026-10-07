import { useState, useRef } from 'react';
import { Camera, ImagePlus, X, User, Shirt } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCapture from './CameraCapture';
import { useCamera } from '@/lib/CameraContext';

export default function PhotoUploader({ type, imageUrl, onImageUploaded, onClear }) {
  const [isUploading, setIsUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const galleryInputRef = useRef(null);
  const { setIsCameraOpen } = useCamera();
  const { t } = useLang();

  const isPersonPhoto = type === 'person';
  const Icon = isPersonPhoto ? User : Shirt;
  const label = isPersonPhoto ? t('yourPhoto') : t('outfitPhoto');
  const hint = isPersonPhoto ? t('uploadSelfie') : t('uploadOutfit');

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  const MAX_SIZE_MB = 10;

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert(t('photoFormatError'));
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(t('photoSizeError', MAX_SIZE_MB));
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onImageUploaded(file_url);
    } catch {
      alert(t('photoFormatError'));
    } finally {
      setIsUploading(false);
    }
  };

  const openCamera = () => { setShowCamera(true); setIsCameraOpen(true); };
  const closeCamera = () => { setShowCamera(false); setIsCameraOpen(false); };

  const handleCameraCapture = async (file) => {
    closeCamera();
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onImageUploaded(file_url);
    } catch {
      alert(t('photoFormatError'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  return (
    <div className="flex-1 flex flex-col">
      <AnimatePresence>
        {showCamera && (
          <CameraCapture
            facingMode={isPersonPhoto ? 'user' : 'environment'}
            onCapture={handleCameraCapture}
            onClose={closeCamera}
          />
        )}
      </AnimatePresence>
      <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
      <p className="text-xs text-muted-foreground mb-3 min-h-[2.5rem] leading-tight">{hint}</p>

      <AnimatePresence mode="wait">
        {imageUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative aspect-[3/4] rounded-2xl overflow-hidden glass"
          >
            <img
              src={imageUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClear}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.04] backdrop-blur-md flex flex-col items-center justify-center gap-4 p-4"
          >
            {isUploading ? (
              <div className="w-8 h-8 border-3 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <>
                <div className="h-14 w-14 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center shadow-[0_0_24px_rgba(140,66,215,0.3)]">
                  <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <button
                    onClick={openCamera}
                    className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-primary to-aurora-pink text-white text-sm font-semibold transition-opacity active:opacity-80 hover:brightness-110"
                  >
                    <Camera className="h-4 w-4" />
                    {t('takePhoto')}
                  </button>
                  <button
                    onClick={handleGalleryClick}
                    className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-white/[0.06] border border-white/15 text-sm font-medium text-foreground transition-colors hover:bg-white/10 active:opacity-80"
                  >
                    <ImagePlus className="h-4 w-4" />
                    {t('gallery')}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery input — no capture attribute so it opens the photo library */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}