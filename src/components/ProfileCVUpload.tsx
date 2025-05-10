"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";

export default function ProfileCVUpload() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        selectedFile.type === "application/msword"
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("PDF эсвэл Word файл байршуулна уу");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "CV байршуулахад алдаа гарлаа");
      }

      // Refresh the page to show the new CV
      window.location.reload();
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "CV байршуулахад алдаа гарлаа";
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  if (!session) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
        CV байршуулахын тулд нэвтрэх шаардлагатай
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="block w-full text-sm text-slate-600
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-slate-900 file:text-white
            hover:file:bg-slate-800
            transition-colors duration-200"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors duration-200 text-sm
            ${
              uploading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-slate-900 hover:bg-slate-800"
            }`}
        >
          {uploading ? "CV байршуулж байна..." : "CV байршуулах"}
        </button>
      )}
    </div>
  );
}
