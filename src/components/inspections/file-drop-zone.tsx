"use client";

import { useCallback, useState } from "react";
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  validateFile,
  formatFileSize,
  MAX_FILE_SIZE_LABEL,
} from "@/lib/file-validation";

interface FileDropZoneProps {
  label: string;
  description: string;
  accept: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string;
}

export function FileDropZone({
  label,
  description,
  accept,
  file,
  onFileSelect,
  error,
}: FileDropZoneProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (candidate: File | undefined) => {
      if (!candidate) return;
      const result = validateFile(candidate);
      if (!result.ok) {
        setLocalError(result.error ?? "Invalid file.");
        onFileSelect(null);
        return;
      }
      setLocalError(null);
      onFileSelect(candidate);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFile(e.target.files?.[0]);
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    setLocalError(null);
    onFileSelect(null);
  }, [onFileSelect]);

  const FileIcon = file?.type === "application/pdf" ? FileText : ImageIcon;
  const shownError = localError ?? error;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {file ? (
        <div className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
            <FileIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove file"
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed px-6 py-8 transition-colors hover:border-primary/50 hover:bg-primary/5",
            isDragging && "border-primary bg-primary/5",
            shownError
              ? "border-destructive/50 bg-destructive/5"
              : "border-border"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{description}</p>
            <p className="text-xs text-muted-foreground">
              PDF, PNG, JPG, or JPEG up to {MAX_FILE_SIZE_LABEL}
            </p>
          </div>
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
        </label>
      )}
      {shownError && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {shownError}
        </p>
      )}
    </div>
  );
}
