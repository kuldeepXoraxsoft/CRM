import { useEffect, useId, useRef, useState } from "react";
import {
  FileText,
  Upload,
  X,
  RefreshCw,
  Plus,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { cn } from "../../lib/cn";
import Field from "./Field";

const formatSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;

/**
 * FileUpload
 *
 * Single mode (default):   value: File | null,    onChange(File | null)
 * Multiple mode:           value: File[],         onChange(File[])
 */
export default function FileUpload({
  label,
  value = null,
  onChange,
  accept,
  multiple = false,
  maxFiles = 10,
  disabled = false,
  required = false,
  error = "",
  helperText = "",
  maxSizeMB = 5,
  className = "",
  containerClassName = "",
}) {
  const id = useId();
  const inputRef = useRef(null);
  const [sizeError, setSizeError] = useState("");

  const files = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value
    ? [value]
    : [];

  const hasFiles = files.length > 0;
  const canAddMore = multiple && files.length < maxFiles;

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const validateSize = (file) =>
    !maxSizeMB || file.size <= maxSizeMB * 1024 * 1024;

  const handleChange = (event) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";

    if (!selected.length) return;

    const errors = [];
    const validFiles = [];

    selected.forEach((file) => {
      if (validateSize(file)) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name} must be smaller than ${maxSizeMB} MB.`);
      }
    });

    if (!multiple) {
      setSizeError(errors[0] || "");
      if (validFiles[0]) onChange?.(validFiles[0]);
      return;
    }

    // Multiple mode: skip duplicates and respect maxFiles
    const existingKeys = new Set(files.map(getFileKey));
    const uniqueFiles = validFiles.filter((f) => !existingKeys.has(getFileKey(f)));

    const slotsLeft = Math.max(maxFiles - files.length, 0);
    const accepted = uniqueFiles.slice(0, slotsLeft);

    if (uniqueFiles.length > slotsLeft) {
      errors.push(`You can upload up to ${maxFiles} files.`);
    }

    setSizeError(errors.join(" "));

    if (accepted.length) {
      onChange?.([...files, ...accepted]);
    }
  };

  const removeFile = (index) => {
    setSizeError("");
    if (multiple) {
      onChange?.(files.filter((_, i) => i !== index));
    } else {
      onChange?.(null);
    }
  };

  const clearAll = () => {
    setSizeError("");
    onChange?.(multiple ? [] : null);
  };

  const hint = (
    <span className="min-w-0 text-xs text-ink-muted">
      {accept ? accept.split(",").join(", ") : "Any file"}
      {maxSizeMB ? ` · Max ${maxSizeMB} MB` : ""}
      {multiple ? ` · Up to ${maxFiles} files` : ""}
    </span>
  );

  return (
    <Field
      label={label}
      htmlFor={id}
      required={required}
      error={error || sizeError}
      helperText={error || sizeError ? "" : helperText}
      className={containerClassName}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
      />

      {!hasFiles ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-md",
              "border border-border-strong bg-surface px-3",
              "text-sm font-medium text-ink shadow-sm",
              "transition-colors hover:border-primary-500 hover:bg-primary-50/50",
              "focus:outline-none focus:ring-2 focus:ring-primary-500/30",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <Upload size={15} />
            {multiple ? "Upload files" : "Upload file"}
          </button>
          {hint}
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file, index) => (
            <FileItem
              key={getFileKey(file)}
              file={file}
              disabled={disabled}
              className={className}
              showChange={!multiple}
              onChange={openPicker}
              onRemove={() => removeFile(index)}
            />
          ))}

          {multiple && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openPicker}
                disabled={disabled || !canAddMore}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5",
                  "border border-border-strong bg-surface text-xs font-medium text-ink",
                  "transition-colors hover:border-primary-500 hover:bg-primary-50/50",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <Plus size={13} />
                Add more
              </button>

              <button
                type="button"
                onClick={clearAll}
                disabled={disabled}
                className="inline-flex h-8 items-center rounded-md px-2 text-xs font-medium text-ink-muted transition-colors hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
              >
                Clear all
              </button>

              <span className="text-xs text-ink-muted">
                {files.length}/{maxFiles} files
              </span>
            </div>
          )}
        </div>
      )}
    </Field>
  );
}

function FileItem({
  file,
  disabled,
  className,
  showChange,
  onChange,
  onRemove,
}) {
  const isImage = file.type?.startsWith("image/");
  const previewUrl = useObjectUrl(file);

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-lg",
        "border border-border bg-surface p-3 shadow-sm",
        className
      )}
    >
      {isImage && previewUrl ? (
        <img
          src={previewUrl}
          alt={file.name}
          className="h-16 w-16 shrink-0 rounded-md border border-border object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-canvas text-ink-muted">
          {isImage ? (
            <ImageIcon size={25} />
          ) : file.type === "application/pdf" ? (
            <FileText size={25} />
          ) : (
            <File size={25} />
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-semibold text-ink"
          title={file.name}
        >
          {file.name}
        </p>
        <p className="mt-1 text-xs text-ink-muted">{formatSize(file.size)}</p>
        <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          File selected
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {showChange && (
          <button
            type="button"
            onClick={onChange}
            disabled={disabled}
            title="Change file"
            aria-label="Change file"
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-50"
          >
            <RefreshCw size={13} />
            Change
          </button>
        )}

        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          title="Remove file"
          aria-label={`Remove ${file.name}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function useObjectUrl(file) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file?.type?.startsWith("image/")) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}