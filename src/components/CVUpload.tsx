'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface Analysis {
  fileName: string;
  analysis: string;
  createdAt: string;
}

export default function CVUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const { data: session } = useSession();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;

    // Check file type
    if (file.type !== 'application/pdf' && 
        file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setError('Please upload a PDF or DOCX file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file:', file.name, file.type);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);

      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error('Server returned invalid response');
      }

      if (!response.ok) {
        throw new Error(data.error || `Failed to upload CV (${response.status})`);
      }

      setAnalysis({
        fileName: data.fileName,
        analysis: data.analysis,
        createdAt: new Date(data.createdAt).toLocaleString(),
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload CV');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Upload Your CV</h2>
        <p className="text-gray-600">Upload your CV in PDF or DOCX format for AI analysis</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF or DOCX files only</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {isUploading && (
          <div className="text-center text-gray-600">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mr-2"></div>
            Analyzing your CV...
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {analysis && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Results</h3>
            <div className="text-sm text-gray-600 mb-2">
              File: {analysis.fileName}
              <br />
              Analyzed on: {analysis.createdAt}
            </div>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {analysis.analysis}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 