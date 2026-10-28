
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  Upload,
  Download,
  Trash2,
  Eye,
  X,
  Paperclip,
} from "lucide-react";
import { accountsApi } from "../../api/Accountsapi";
import { FileUpload } from "../../components/ui";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_TYPES =
  ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.csv,.txt";

function formatSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType = "" }) {
  if (mimeType.startsWith("image/")) {
    return <FileImage size={20} />;
  }

  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    mimeType.includes("csv")
  ) {
    return <FileSpreadsheet size={20} />;
  }

  return <FileText size={20} />;
}

export default function AccountDocuments({ accountId }) {
  const inputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState(null);

  async function loadDocuments() {
    const result = await accountsApi.listDocuments(accountId);
    setDocuments(result?.data || []);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError("");
        const result = await accountsApi.listDocuments(accountId);
        if (!cancelled) setDocuments(result?.data || []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
            "Could not load account documents."
          );
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [accountId]);

  useEffect(() => {
    return () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  function selectFile(event) {
    const selected = event.target.files?.[0] || null;
    setError("");
    setSuccess("");

    if (selected && selected.size > MAX_FILE_SIZE) {
      setError("File size must be 10 MB or less.");
      setFile(null);
      event.target.value = "";
      return;
    }

    setFile(selected);
  }

  async function handleUpload(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter a document title.");
      return;
    }

    if (!file) {
      setError("Please select a file.");
      return;
    }

    setLoading(true);

    try {
      await accountsApi.uploadDocument(accountId, {
        title: title.trim(),
        file,
      });

      setTitle("");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";

      await loadDocuments();
      setSuccess("Document uploaded successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Document upload failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(doc, shouldPreview = false) {
    setError("");
    setBusyId(doc.id);

    try {
      const blob = await accountsApi.downloadDocument(accountId, doc.id);
      const url = URL.createObjectURL(blob);

      if (shouldPreview) {
        if (preview?.url) URL.revokeObjectURL(preview.url);
        setPreview({
          url,
          name: doc.originalName,
          mimeType: doc.mimeType,
        });
        return;
      }

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = doc.originalName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Could not open or download this document."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(doc) {
    const confirmed = window.confirm(
      `Delete "${doc.title}" permanently?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setBusyId(doc.id);

    try {
      await accountsApi.deleteDocument(accountId, doc.id);
      setDocuments((current) =>
        current.filter((item) => item.id !== doc.id)
      );
      setSuccess("Document deleted successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Could not delete this document."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <Paperclip size={18} />
            Documents
            <span className="rounded-full bg-canvas px-2 py-0.5 text-xs text-ink-muted">
              {documents.length}
            </span>
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Upload, preview, download and manage account files.
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-ink">
            {success}
          </div>
        )}

        <form
          onSubmit={handleUpload}
          className="space-y-3 rounded-xl border border-dashed border-border bg-canvas/50 p-4"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Document title
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={150}
              placeholder="e.g. Signed Service Agreement"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <FileUpload
  value={file}
  onChange={setFile}
/>
           
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={16} />
            {loading ? "Uploading..." : "Upload document"}
          </button>
        </form>

        <div className="divide-y divide-border">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-canvas text-ink-muted">
                <FileIcon mimeType={doc.mimeType} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {doc.title}
                </p>
                <p className="mt-1 truncate text-xs text-ink-muted">
                  {doc.originalName} · {formatSize(doc.size)}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  Uploaded{" "}
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {(doc.mimeType.startsWith("image/") ||
                  doc.mimeType === "application/pdf") && (
                  <button
                    type="button"
                    title="Preview"
                    disabled={busyId === doc.id}
                    onClick={() => handleDownload(doc, true)}
                    className="rounded-lg border border-border p-2 text-ink-muted hover:bg-canvas disabled:opacity-50"
                  >
                    <Eye size={16} />
                  </button>
                )}

                <button
                  type="button"
                  title="Download"
                  disabled={busyId === doc.id}
                  onClick={() => handleDownload(doc)}
                  className="rounded-lg border border-border p-2 text-ink-muted hover:bg-canvas disabled:opacity-50"
                >
                  <Download size={16} />
                </button>

                <button
                  type="button"
                  title="Delete document"
                  disabled={busyId === doc.id}
                  onClick={() => handleDelete(doc)}
                  className="rounded-lg border border-border p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {documents.length === 0 && (
            <div className="py-10 text-center">
              <FileText
                size={28}
                className="mx-auto text-ink-muted"
              />
              <p className="mt-3 text-sm font-medium text-ink">
                No documents uploaded
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                Upload an account document using the form above.
              </p>
            </div>
          )}
        </div>
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-xl bg-surface shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="truncate text-sm font-semibold text-ink">
                {preview.name}
              </p>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-lg p-2 text-ink-muted hover:bg-canvas"
                aria-label="Close preview"
              >
                <X size={18} />
              </button>
            </div>

            {preview.mimeType.startsWith("image/") ? (
              <div className="flex max-h-[75vh] justify-center overflow-auto bg-canvas p-3">
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="max-h-[70vh] max-w-full object-contain"
                />
              </div>
            ) : (
              <iframe
                title={preview.name}
                src={preview.url}
                className="h-[75vh] w-full"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
