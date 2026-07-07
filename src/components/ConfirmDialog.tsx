"use client";

import React, { useEffect, useRef } from "react";
import { Icon } from "@/components/Icons";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action? This operation cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isLoading = false,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape key press
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, isLoading]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur */}
      <div
        className="absolute inset-0 bg-brand-dark/25 backdrop-blur-[3px] transition-opacity duration-300 animate-fade-in"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      {/* Dialog Frame */}
      <div
        ref={overlayRef}
        className="bg-white w-full max-w-sm rounded-default shadow-xl border border-gray-100 p-6 relative z-10 animate-scale-up font-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="flex flex-col gap-4 text-center sm:text-left">
          {/* Warning Icon Badge */}
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto sm:mx-0 shadow-inner">
            <Icon name="delete" size={24} />
          </div>

          {/* Texts */}
          <div className="space-y-1.5">
            <h3
              id="dialog-title"
              className="font-serif text-lg font-bold text-brand-dark"
            >
              {title}
            </h3>
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2.5 pt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-gray-500 hover:text-brand-dark border border-[#e4d7d0]/60 hover:border-gray-300 bg-white rounded-default transition-all duration-150 disabled:opacity-50 cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-brand-main2 hover:bg-brand-main2/90 rounded-default transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Icon name="loader" size={14} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>{confirmLabel}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
