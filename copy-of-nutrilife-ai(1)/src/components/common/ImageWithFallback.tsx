import React, { useState } from 'react';
import { BeakerIcon } from './Icon';

interface ImageWithFallbackProps {
  src: string | undefined;
  alt: string;
  className?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, className }) => {
  const [hasError, setHasError] = useState(false);

  // If the src is invalid or has thrown an error, show a placeholder.
  if (hasError || !src) {
    return (
        <div className={`flex items-center justify-center bg-slate-100 rounded-lg ${className}`}>
            <BeakerIcon className="h-1/3 w-1/3 text-slate-300" />
        </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setHasError(true)} />;
};

export default ImageWithFallback;