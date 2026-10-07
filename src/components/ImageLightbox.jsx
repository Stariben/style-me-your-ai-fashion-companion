import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import useSignedUrl from '@/hooks/useSignedUrl';

export default function ImageLightbox({ src: ref, alt, onClose }) {
  const src = useSignedUrl(ref);
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white"
      >
        <X className="h-5 w-5" />
      </button>
      <motion.img
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>,
    document.body
  );
}