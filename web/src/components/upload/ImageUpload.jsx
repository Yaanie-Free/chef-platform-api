"use client";
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function ImageUpload({ 
  onUpload, 
  maxFiles = 5, 
  maxSize = 5 * 1024 * 1024, // 5MB
  minWidth = 1000,
  minHeight = 1000,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  existingImages = []
}) {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const errors = [];

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      errors.push(`${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`);
      return errors;
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(`${file.name}: File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
      return errors;
    }

    return errors;
  };

  const validateImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < minWidth || img.height < minHeight) {
          resolve([`${file.name}: Image must be at least ${minWidth}x${minHeight} pixels.`]);
        } else {
          resolve([]);
        }
      };
      img.onerror = () => {
        resolve([`${file.name}: Invalid image file.`]);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const newFiles = [];
    const newErrors = [];

    // Check total file count
    if (files.length + fileArray.length > maxFiles) {
      setErrors([`Maximum ${maxFiles} files allowed.`]);
      return;
    }

    for (const file of fileArray) {
      // Basic validation
      const basicErrors = validateFile(file);
      if (basicErrors.length > 0) {
        newErrors.push(...basicErrors);
        continue;
      }

      // Image dimension validation
      const dimensionErrors = await validateImageDimensions(file);
      if (dimensionErrors.length > 0) {
        newErrors.push(...dimensionErrors);
        continue;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      newFiles.push({
        file,
        preview,
        id: Date.now() + Math.random(),
        status: 'pending'
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
    setErrors(newErrors);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = (fileId) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setErrors([]);

    const formData = new FormData();
    files.forEach((fileObj, index) => {
      formData.append('images', fileObj.file);
    });

    try {
      const response = await fetch('/api/chefs/profile/images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        // Update file statuses
        setFiles(prev => prev.map(f => ({ ...f, status: 'success' })));
        
        // Call onUpload callback with uploaded images
        if (onUpload) {
          onUpload(data.uploaded);
        }

        // Clear files after successful upload
        setTimeout(() => {
          setFiles([]);
        }, 2000);
      } else {
        setErrors([data.error || 'Upload failed']);
        setFiles(prev => prev.map(f => ({ ...f, status: 'error' })));
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(['Upload failed. Please try again.']);
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' })));
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className="border-2 border-dashed border-border/40 rounded-3xl p-8 text-center hover:border-pink-200/50 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-pink-500" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload Images</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop images here, or click to select files
            </p>
            <p className="text-xs text-muted-foreground">
              Minimum {minWidth}x{minHeight}px • Max {maxSize / (1024 * 1024)}MB each • Up to {maxFiles} files
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl"
            disabled={isUploading}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Choose Files
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Card className="p-4 rounded-2xl bg-red-500/10 border border-red-200/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-500">{error}</p>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* File Previews */}
      {(files.length > 0 || existingImages.length > 0) && (
        <div className="space-y-4">
          <h4 className="font-medium">Selected Images</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Existing Images */}
            {existingImages.map((image, index) => (
              <div key={`existing-${index}`} className="relative group">
                <ImageWithFallback
                  src={image.url}
                  alt={`Existing image ${index + 1}`}
                  className="w-full h-32 rounded-2xl object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      // Handle existing image removal
                      console.log('Remove existing image:', image.id);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* New Files */}
            {files.map((fileObj) => (
              <div key={fileObj.id} className="relative group">
                <ImageWithFallback
                  src={fileObj.preview}
                  alt="Preview"
                  className="w-full h-32 rounded-2xl object-cover"
                />
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFile(fileObj.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Status Indicator */}
                <div className="absolute top-2 right-2">
                  {getStatusIcon(fileObj.status)}
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          {files.length > 0 && (
            <Button
              onClick={uploadFiles}
              disabled={isUploading}
              className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500"
            >
              {isUploading ? 'Uploading...' : `Upload ${files.length} Image${files.length !== 1 ? 's' : ''}`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}