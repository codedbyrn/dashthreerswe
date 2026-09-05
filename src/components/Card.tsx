"use client";

import React, { useState } from "react";
import { Icon } from "@/components/Icons";

export interface CardProps {
  // Loading State
  isLoading?: boolean;

  // Header Props
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  favorite?: boolean;
  onFavoriteToggle?: () => void;

  // Content Props
  coverImage?: string | null;
  title: string;
  url?: string | null;
  urlIcon?: string;
  primaryDescription?: string | null;
  secondaryDescription?: string | null;
  onSecondaryDescriptionClick?: () => void;

  // Footer Props
  tags?: string[];
  onEdit?: () => void;
  onDelete?: () => void;

  // Extension Slots
  customContent?: React.ReactNode;
  customActions?: React.ReactNode;

  // Direction (RTL support)
  dir?: "ltr" | "rtl" | "auto";
}

export const Card: React.FC<CardProps> = ({
  isLoading = false,
  headerLeft,
  headerRight,
  favorite,
  onFavoriteToggle,
  ,
  title,
  url,
  urlIcon = "externalLink",
  primaryDescription,
  secondaryDescription,
  onSecondaryDescriptionClick,
  tags = [],
  onEdit,
  onDelete,
  customContent,
  customActions,
  dir,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // --- 1. SKELETON LOADING STATE ---
  if (isLoading) {
    return (
      <div className="bg-white rounded-default p-5 shadow-sm border border-gray-100 animate-pulse flex flex-col justify-between h-full min-h-[220px]">
        <div>
          {/* Header Skeleton */}
          <div className="flex justify-between items-center mb-4">
            <div className="h-4 w-12 bg-gray-200 rounded-sm"></div>
            <div className="h-4 w-20 bg-gray-200 rounded-sm"></div>
          </div>
          {/* Cover Image Skeleton */}
          <div className="h-32 bg-gray-100 rounded-sm mb-4"></div>
          {/* Title & Desc Skeleton */}
          <div className="h-5 bg-gray-200 rounded-sm w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded-sm w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded-sm w-5/6"></div>
        </div>
        {/* Footer Skeleton */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex gap-1">
            <div className="h-4 w-10 bg-gray-100 rounded-full"></div>
            <div className="h-4 w-10 bg-gray-100 rounded-full"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-12 bg-gray-100 rounded-sm"></div>
            <div className="h-6 w-12 bg-gray-100 rounded-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. REGULAR CARD RENDERING ---
  return (
    <div dir={dir} className="bg-white rounded-default p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-main2/20 transition-all duration-200 flex flex-col justify-between h-full min-h-[220px] relative overflow-hidden group">
      {/* Editorial subtle line effect */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-main1/30 to-brand-main2/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div>
        {/* Header Section */}
        {(headerLeft || headerRight || onFavoriteToggle) && (
          <div className="flex justify-between items-center gap-2 mb-3.5 text-xs text-gray-400">
            {/* Left Header items (Favorites, Status, Visibility) */}
            <div className="flex items-center gap-2">
              {onFavoriteToggle && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onFavoriteToggle();
                  }}
                  className={`cursor-pointer transition-colors p-1 rounded-full hover:bg-brand-bg/50 ${
                    favorite ? "text-brand-main2" : "text-gray-300 hover:text-gray-500"
                  }`}
                  aria-label="Toggle favorite"
                >
                  <Icon name={favorite ? "heartFilled" : "heart"} size={16} />
                </button>
              )}
              {headerLeft}
            </div>

            {/* Right Header items (Badges, type badges) */}
            <div className="flex items-center gap-1.5">{headerRight}</div>
          </div>
        )}

        {/* Cover Image */}
        {coverImage && (
          <div className="relative w-full h-50 mb-4 rounded-sm overflow-hidden bg-brand-bg/10 border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt={title}
              className="object-cover w-full h-full"
              loading="lazy"
            />
          </div>
        )}

        {/* Title */}
        <h3 className="font-serif text-base font-bold text-brand-dark leading-snug mb-1 group-hover:text-brand-main2 transition-colors duration-180">
          {title}
        </h3>

        {/* URL / Link */}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-brand-main2 hover:underline mb-2.5"
          >
            <span>{url.replace(/https?:\/\/(www\.)?/, "")}</span>
            <Icon name={urlIcon} size={10} className="stroke-[2.5]" />
          </a>
        )}

        {/* Custom content injected from parent */}
        {customContent}

        {/* Description Stack */}
        {primaryDescription && (
          <p className="text-xs text-gray-500 font-serif leading-relaxed mb-2.5">
            {primaryDescription}
          </p>
        )}

        {secondaryDescription && (
          <div className="mb-2">
            {isExpanded ? (
              <p
                onClick={() => setIsExpanded(false)}
                className="text-[11px] text-gray-400 font-sans leading-relaxed cursor-pointer hover:text-brand-dark"
              >
                {secondaryDescription}{" "}
                <span className="text-brand-main2 font-semibold hover:underline">Show less</span>
              </p>
            ) : (
              <p
                onClick={() => {
                  if (onSecondaryDescriptionClick) {
                    onSecondaryDescriptionClick();
                  } else {
                    setIsExpanded(true);
                  }
                }}
                className="text-[11px] text-gray-400 font-sans leading-relaxed truncate cursor-pointer hover:text-brand-dark"
                title="Click to view more"
              >
                {secondaryDescription}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2">
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-block bg-brand-bg/50 text-[10px] text-brand-dark/70 px-2 py-0.5 rounded-full border border-[#e4d7d0]/30 hover:border-brand-main2/20 transition-colors cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Buttons / Custom Actions */}
        <div className="flex items-center gap-1.5 ms-auto">
          {customActions}
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-brand-main2 hover:bg-brand-bg/30 px-2 py-1 rounded-sm transition-all cursor-pointer"
              aria-label="Edit item"
            >
              <Icon name="edit" size={13} />
              <span>Edit</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-sm transition-all cursor-pointer"
              aria-label="Delete item"
            >
              <Icon name="delete" size={13} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
