"use client";
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle, Trash2, Edit3 } from 'lucide-react';
import UniversalButton from '@/components/ui/UniversalButton';
import UniversalCard from '@/components/ui/UniversalCard';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

const LogoUpload = ({ 
  onUpload, 
  onRemove,
  onUpdate,
  maxFiles = 1, 
  maxSize = 2 * 1024 * 1024, // 2MB
  minWidth = 200, 
  minHeight = 200,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
  existingLogos = [],
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const validateFile = (file) => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Only ${acceptedTypes.join(', ')} are allowed.`);
    }

    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
    }

    return true;
  };

  const validateImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < minWidth || img.height < minHeight) {
          reject(new Error(`Image dimensions too small. Minimum size is ${minWidth}x${minHeight}px.`));
        } else {
          resolve(true);
        }
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFile = async (file) => {
    try {
      setError('');
      setUploading(true);

      // Validate file
      validateFile(file);
      await validateImageDimensions(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload file
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      onUpload?.(result.logo);
      setUploading(false);
    } catch (err) {
      setError(err.message);
      setUploading(false);
      setPreview(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = (logoId) => {
    onRemove?.(logoId);
    setPreview(null);
  };

  const handleUpdate = (logoId) => {
    onUpdate?.(logoId);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <UniversalCard
        className={cn(
          'border-2 border-dashed transition-all duration-200',
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          uploading && 'opacity-50 pointer-events-none'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center py-8 sm:py-12">
          {preview ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Logo preview"
                  className={cn(
                    'rounded-lg shadow-lg',
                    isMobile ? 'w-32 h-32' : 'w-48 h-48'
                  )}
                />
                <UniversalButton
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={() => setPreview(null)}
                >
                  <X className="h-3 w-3" />
                </UniversalButton>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Logo Preview
                </p>
                <p className="text-xs text-muted-foreground">
                  Click to upload a different logo
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={cn(
                'mx-auto rounded-full bg-muted flex items-center justify-center',
                isMobile ? 'w-16 h-16' : 'w-20 h-20'
              )}>
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                ) : (
                  <Upload className={cn(
                    'text-muted-foreground',
                    isMobile ? 'h-6 w-6' : 'h-8 w-8'
                  )} />
                )}
              </div>
              <div className="space-y-2">
                <h3 className={cn(
                  'font-semibold text-foreground',
                  isMobile ? 'text-lg' : 'text-xl'
                )}>
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </h3>
                <p className={cn(
                  'text-muted-foreground',
                  isMobile ? 'text-sm' : 'text-base'
                )}>
                  Drag and drop your logo here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP, SVG up to {Math.round(maxSize / 1024 / 1024)}MB
                  <br />
                  Minimum size: {minWidth}x{minHeight}px
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
          />

          {!preview && (
            <UniversalButton
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-4"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </UniversalButton>
          )}
        </div>
      </UniversalCard>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Existing Logos */}
      {existingLogos.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Current Logos</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingLogos.map((logo, index) => (
              <div key={logo.id || index} className="relative group">
                <UniversalCard className="p-2">
                  <img
                    src={logo.url}
                    alt={`Logo ${index + 1}`}
                    className="w-full aspect-square object-contain rounded"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center gap-2">
                    <UniversalButton
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() => handleRemove(logo.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </UniversalButton>
                    <UniversalButton
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => handleUpdate(logo.id)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </UniversalButton>
                  </div>
                </UniversalCard>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-2">Logo Guidelines</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Use high-resolution images for best quality</li>
          <li>• Ensure your logo is clearly visible on both light and dark backgrounds</li>
          <li>• Square or rectangular logos work best</li>
          <li>• Avoid text-heavy logos as they may be hard to read when small</li>
          <li>• SVG format is recommended for crisp display at all sizes</li>
        </ul>
      </div>
    </div>
  );
};

export default LogoUpload;