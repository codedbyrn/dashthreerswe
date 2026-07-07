"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/Icons";
import { createClient } from "@/auth/utils/supabase/client";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

interface FileMetadata {
  name: string;
  size: string;
  type: string;
  dimensions: string;
}

// Format bytes helper
function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Get image dimensions helper for local Files
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

// Get image dimensions helper for URLs (existing images)
function getUrlImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
}

// Client-side canvas-based image compression
async function compressImage(
  file: File,
  quality = 0.8,
  maxWidth = 1200,
  maxHeight = 1200
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context is not available"));
          return;
        }

        // Draw white background to handle transparent PNGs nicely
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => {
        reject(err);
      };
    };
    reader.onerror = (err) => {
      reject(err);
    };
  });
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // If value is set from outside (e.g. existing database URL), construct metadata dynamically
  useEffect(() => {
    if (value && value.startsWith("http")) {
      const fileName = value.split("/").pop()?.split("?")[0] || "image.jpg";
      const cleanFileName = decodeURIComponent(fileName);
      
      // Fetch dimensions of public image URL
      getUrlImageDimensions(value).then(({ width, height }) => {
        setFileMeta({
          name: cleanFileName.substring(cleanFileName.indexOf("-") + 1) || cleanFileName,
          size: "Cloud Stored",
          type: "image/jpeg",
          dimensions: width > 0 ? `${width} × ${height} px` : "Dimensions loaded",
        });
      });
    } else if (!value) {
      setFileMeta(null);
    }
  }, [value]);

  const processFile = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Validate: Format Check (must be image/*)
      if (!file.type.startsWith("image/")) {
        throw new Error("Unsupported format. Please select an image file.");
      }

      // Validate: Size Check (> 3MB rejected)
      if (file.size > 3 * 1024 * 1024) {
        throw new Error("File size exceeds 3 MB limit.");
      }

      // Read dimensions of the local file
      const originalSize = file.size;
      const dims = await getImageDimensions(file);
      const originalSizeStr = formatBytes(originalSize);

      setFileMeta({
        name: file.name,
        size: `${originalSizeStr} (Original)`,
        type: file.type,
        dimensions: `${dims.width} × ${dims.height} px`,
      });

      setUploadProgress(30);

      // Perform compression (unless it's an SVG or GIF which shouldn't be flattened)
      let uploadPayload: Blob = file;
      let isCompressed = false;

      if (file.type !== "image/svg+xml" && file.type !== "image/gif") {
        setUploadProgress(50);
        try {
          const compressed = await compressImage(file, 0.8, 1200, 1200);
          uploadPayload = compressed;
          isCompressed = true;

          const compressedSizeStr = formatBytes(compressed.size);
          setFileMeta((prev) =>
            prev
              ? {
                  ...prev,
                  size: `${compressedSizeStr} (Optimized from ${originalSizeStr})`,
                }
              : null
          );
        } catch (compErr) {
          console.warn("Client compression failed, uploading original:", compErr);
        }
      }

      setUploadProgress(70);

      // Initialize browser client
      const supabase = createClient();

      // Setup unique file name
      const fileExt = isCompressed ? "jpg" : file.name.split(".").pop() || "jpg";
      const randomId = Math.random().toString(36).substring(2, 9);
      const filePath = `inspirations/${Date.now()}-${randomId}.${fileExt}`;

      // Upload to Supabase Storage bucket 'assets'
      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(filePath, uploadPayload, {
          contentType: isCompressed ? "image/jpeg" : file.type,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setUploadProgress(90);

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("assets")
        .getPublicUrl(filePath);

      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        onChange(publicUrl);
      }, 200);
    } catch (err: any) {
      console.error("Upload failure:", err);
      setError(err.message || "An unexpected error occurred during upload.");
      setIsUploading(false);
      setFileMeta(null);
    }
  };

  // Event handlers for file input selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onChange(null);
    setFileMeta(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-3 font-sans">
      {/* File input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        disabled={disabled || isUploading}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 1. UPLOADING PROGRESS STATE */}
      {isUploading && (
        <div className="border border-brand-main2/20 bg-brand-bg/10 rounded-default p-6 flex flex-col items-center justify-center gap-4 animate-pulse">
          <Icon name="loader" size={28} className="animate-spin text-brand-main2" />
          <div className="w-full max-w-[240px]">
            <div className="flex justify-between items-center text-[10px] font-bold text-brand-dark/70 mb-1.5 uppercase tracking-wide">
              <span>Optimizing &amp; Uploading</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-brand-main2 h-1.5 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* 2. INACTIVE/DROPZONE STATE */}
      {!isUploading && !value && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerSelect}
          className={`border-2 border-dashed rounded-default p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragActive
              ? "border-brand-main2 bg-brand-bg/20 scale-[0.99]"
              : "border-gray-200 hover:border-brand-main2/60 bg-white hover:bg-gray-50/50"
          } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className="p-3 bg-brand-bg/50 text-brand-main2 rounded-full mb-1">
            <Icon name="image" size={22} />
          </div>
          <div className="text-xs font-bold text-brand-dark text-center">
            Drag &amp; drop an image here, or <span className="text-brand-main2 hover:underline">browse</span>
          </div>
          <div className="text-[10px] text-gray-400 font-semibold text-center tracking-wide">
            Supports JPG, PNG, GIF, WebP up to 3 MB
          </div>
        </div>
      )}

      {/* 3. SUCCESS / PREVIEW STATE */}
      {!isUploading && value && (
        <div className="border border-gray-100 bg-white rounded-default p-4 flex flex-col sm:flex-row gap-4 items-center sm:items-start shadow-sm hover:shadow-md transition-shadow">
          {/* Image Preview */}
          <div className="relative w-28 h-28 rounded-md overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Curated preview"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Details & Actions Panel */}
          <div className="flex-1 w-full flex flex-col justify-between h-full py-1 text-center sm:text-left">
            <div className="space-y-1">
              <div className="text-xs font-bold text-brand-dark line-clamp-1 break-all" title={fileMeta?.name}>
                {fileMeta?.name || "Uploaded Curation Image"}
              </div>
              
              {fileMeta && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 text-[10px] text-gray-500 font-medium font-sans">
                  <div>
                    <span className="font-bold text-brand-dark/45 uppercase tracking-wider block text-[8px]">Size</span>
                    <span className="truncate block">{fileMeta.size}</span>
                  </div>
                  <div>
                    <span className="font-bold text-brand-dark/45 uppercase tracking-wider block text-[8px]">Dimensions</span>
                    <span className="truncate block">{fileMeta.dimensions}</span>
                  </div>
                  <div className="mt-1">
                    <span className="font-bold text-brand-dark/45 uppercase tracking-wider block text-[8px]">Type</span>
                    <span className="truncate block uppercase">{fileMeta.type.replace("image/", "")}</span>
                  </div>
                  <div className="mt-1">
                    <span className="font-bold text-brand-dark/45 uppercase tracking-wider block text-[8px]">Storage</span>
                    <span className="text-brand-main2 font-semibold block uppercase">Supabase assets</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
              <button
                type="button"
                disabled={disabled}
                onClick={triggerSelect}
                className="text-[10px] font-bold text-brand-main2 hover:underline cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <Icon name="edit" size={12} />
                <span>Replace Image</span>
              </button>
              <span className="h-3 w-[1px] bg-gray-200"></span>
              <button
                type="button"
                disabled={disabled}
                onClick={handleRemove}
                className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <Icon name="delete" size={12} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ERROR MESSAGE PANEL */}
      {error && (
        <div className="bg-red-50 text-red-800 border border-red-100 text-[11px] font-semibold px-3 py-2.5 rounded-default flex items-start gap-2 animate-fade-in">
          <Icon name="delete" size={13} className="mt-0.5 flex-shrink-0 text-red-500" />
          <div className="flex-1">
            {error}
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-[10px] text-red-800 font-bold hover:underline cursor-pointer flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
