import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { UploadCloud, FileSpreadsheet, AlertTriangle } from "lucide-react";

import { Modal, Button } from "../../../components/ui";
import { LEAD_HEADER_MAP, createEmptyLead } from "../../../data/Leaddata";
import { leadsApi } from "../../../api/leadsApi";
import { useToast } from "../../../context/toastContext";


function normalizeHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function mapRowToLead(row) {
  const lead = createEmptyLead();
  Object.keys(row).forEach((rawHeader) => {
    const normalized = normalizeHeader(rawHeader);
    const fieldKey = LEAD_HEADER_MAP[normalized];
    if (fieldKey) {
      let value = row[rawHeader];
      if (value instanceof Date) {
        value = value.toISOString().slice(0, 10);
      }
      lead[fieldKey] = value === undefined || value === null ? "" : String(value).trim();
    }
  });
  return lead;
}

export default function BulkUploadModal({ isOpen, onClose, onBulkImport }) {
  const fileInputRef = useRef(null);
  const { success, error} = useToast(); 
  const [fileName, setFileName] = useState("");
  const [parsedLeads, setParsedLeads] = useState([]);
  const [issue, setIssue] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  function resetState() {
    setFileName("");
    setParsedLeads([]);
    setIssue("");
    setIsParsing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    resetState();
    onClose();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIssue("");
    setIsParsing(true);
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true});
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!rows.length) {
          setIssue("No rows found in this file. Please check the sheet and try again.");
          setParsedLeads([]);
          setIsParsing(false);
          return;
        }

        const leads = rows
          .map(mapRowToLead)
          .filter((lead) => lead.customerName.trim() !== "");

        if (!leads.length) {
          setIssue(
            "Could not find a 'Customer Name' column, or all rows are missing a customer name."
          );
          setParsedLeads([]);
          setIsParsing(false);
          return;
        }

        setParsedLeads(leads);
        setIsParsing(false);
      } catch (err) {
        setIssue("Failed to read this file. Please upload a valid .xlsx, .xls or .csv file.");
        setParsedLeads([]);
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setIssue("Failed to read this file. Please try again.");
      setIsParsing(false);
    };

    reader.readAsArrayBuffer(file);
  }

  function handleConfirmImport() {
    if (!parsedLeads.length) return;
    onBulkImport(parsedLeads);
    resetState();
    onClose();
  }

  async function handleSampleDownload() {
  try {
    console.log("working");
    await leadsApi.downloadSample();
  } catch (issue) {
    console.error("Failed to download lead sample:", issue);

    setIssue(
      error?.response?.data?.message ||
        "Failed to download sample file. Please try again."
    );
  }
}

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Upload Leads"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={!parsedLeads.length} onClick={handleConfirmImport}>
            Import {parsedLeads.length > 0 ? parsedLeads.length : ""} Lead
            {parsedLeads.length === 1 ? "" : "s"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-ink-muted">
            Upload an Excel (.xlsx / .xls) or CSV file. First row should have
            column headers like{" "}
            <strong className="text-ink">Customer Name</strong>,{" "}
            <strong className="text-ink">Company AM</strong>,{" "}
            <strong className="text-ink">Status</strong>,{" "}
            <strong className="text-ink">Phone Number</strong>,{" "}
            <strong className="text-ink">Email</strong>, etc.
          </p>

          <button
            type="button"
            onClick={handleSampleDownload}
            className="shrink-0 text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            Download Sample File
          </button>
        </div>

        <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-border px-4 py-7 text-center transition-colors hover:border-primary-500 hover:bg-primary-50">
          <UploadCloud size={28} className="text-primary-600" />
          <span className="text-sm font-medium text-ink">
            {fileName ? fileName : "Click to choose a file"}
          </span>
          <span className="text-xs text-ink-faint">.xlsx, .xls or .csv</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            hidden
          />
        </label>

        {isParsing && <p className="text-sm text-ink-muted">Reading file...</p>}

        {issue && (
          <div className="flex items-center gap-2 rounded-md border border-danger-100 bg-danger-50 px-3 py-2.5 text-sm text-danger-500">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{issue}</span>
          </div>
        )}

        {parsedLeads.length > 0 && !issue && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <FileSpreadsheet size={16} className="text-primary-600" />
              <span>
                {parsedLeads.length} lead{parsedLeads.length > 1 ? "s" : ""} ready to
                import
              </span>
            </div>

            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full whitespace-nowrap text-left text-xs">
                <thead className="bg-canvas">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-ink">Customer Name</th>
                    <th className="px-3 py-2 font-semibold text-ink">Cyvora AM</th>
                    <th className="px-3 py-2 font-semibold text-ink">Status</th>
                    <th className="px-3 py-2 font-semibold text-ink">Phone Number</th>
                    <th className="px-3 py-2 font-semibold text-ink">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedLeads.slice(0, 8).map((lead) => (
                    <tr key={lead.id} className="border-t border-border">
                      <td className="px-3 py-2 text-ink-muted">{lead.customerName || "-"}</td>
                      <td className="px-3 py-2 text-ink-muted">{lead.cyvoraAM || "-"}</td>
                      <td className="px-3 py-2 text-ink-muted">{lead.status || "-"}</td>
                      <td className="px-3 py-2 text-ink-muted">{lead.phoneNumber || "-"}</td>
                      <td className="px-3 py-2 text-ink-muted">{lead.email || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parsedLeads.length > 8 && (
              <p className="text-xs text-ink-faint">
                + {parsedLeads.length - 8} more row(s) not shown in preview
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}