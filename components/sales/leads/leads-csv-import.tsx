"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { csvRowsToLeads, parseCsvText } from "@/lib/leads/parse-csv";

type LeadsCsvImportProps = {
  onComplete: () => Promise<void> | void;
};

export function LeadsCsvImport({ onComplete }: LeadsCsvImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImporting(true);
    setMessage(null);
    setError(null);

    try {
      const text = await file.text();
      const { headers, rows } = parseCsvText(text);

      if (headers.length === 0 || rows.length === 0) {
        throw new Error("CSV is empty or missing a header row.");
      }

      const leads = csvRowsToLeads(headers, rows);
      if (leads.length === 0) {
        throw new Error(
          "No valid rows found. Include at least email, phone, or name columns.",
        );
      }

      let imported = 0;
      let duplicates = 0;
      const batchSize = 100;

      for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize);
        const response = await fetch("/api/leads/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leads: batch }),
        });

        const payload = (await response.json()) as {
          error?: string;
          imported?: number;
          duplicates?: number;
          errors?: string[];
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Import failed");
        }

        imported += payload.imported ?? 0;
        duplicates += payload.duplicates ?? 0;

        if (payload.errors?.length) {
          throw new Error(payload.errors[0]);
        }
      }

      setMessage(
        `Imported ${imported} lead${imported === 1 ? "" : "s"}${duplicates ? ` · ${duplicates} duplicates` : ""}.`,
      );
      await onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "CSV import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={importing}
        className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium"
        style={{
          background: "var(--accent-subtle)",
          borderColor: "var(--accent)",
          color: "var(--accent)",
        }}
      >
        <Upload className={`h-3.5 w-3.5 ${importing ? "animate-pulse" : ""}`} />
        {importing ? "Importing..." : "Import CSV"}
      </button>
      {message ? (
        <p className="text-[10px]" style={{ color: "var(--success)" }}>
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="max-w-[220px] text-right text-[10px]" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
