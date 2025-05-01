"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useChat } from "@/providers/ChatProvider";

interface JobMatch {
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
    location: string;
    salary?: string;
    requirements: string;
  };
  matchScore: number;
  matchDetails: {
    experience: number;
    skills: number;
    education: number;
    overall: number;
  };
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function CVUpload() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [noMatches, setNoMatches] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage } = useChat();

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
        setError("Please upload a PDF or Word document");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setAnalysis(null);
    setJobMatches([]);
    setNoMatches(false);

    // Show initial loading message
    await sendMessage("CV-г боловсруулж байна. Түр хүлээнэ үү...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Upload CV and get analysis
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload CV");
      }

      if (!data.success || !data.analysis) {
        throw new Error("CV analysis failed");
      }

      // Set the analysis state
      setAnalysis(data.analysis);

      // Send the analysis to chat
      await sendMessage(`CV Шинжилгээ:\n\n${data.analysis}`);

      // Show loading message for job matches
      await sendMessage("Ажлын байруудыг хайж байна...");

      if (data.matches && data.matches.length > 0) {
        setJobMatches(data.matches);
        // Send job matches to chat
        const matchesMessage = data.matches
          .map(
            (match: JobMatch) =>
              `Ажлын байр: ${match.job.title}\nКомпани: ${
                match.job.company.name
              }\nТохиролт: ${Math.round(
                match.matchScore
              )}%\n\nТохиролтын дэлгэрэнгүй:\n- Туршлага: ${Math.round(
                match.matchDetails.experience
              )}%\n- Ур чадвар: ${Math.round(
                match.matchDetails.skills
              )}%\n- Боловсрол: ${Math.round(match.matchDetails.education)}%`
          )
          .join("\n\n");
        await sendMessage(
          `Таны CV-тэй тохирох ажлын байрууд:\n\n${matchesMessage}`
        );
      } else {
        setNoMatches(true);
        await sendMessage(
          "Уучлаарай, таны CV-тэй тохирох ажлын байр олдсонгүй. Дараах зүйлсийг хийж болно:\n\n1. CV-гээ сайжруулах\n2. Илүү олон ур чадвар нэмэх\n3. Дараа дахин оролдох"
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload CV";
      setError(errorMessage);
      await sendMessage(
        `Уучлаарай, CV-г боловсруулахад алдаа гарлаа:\n\n${errorMessage}\n\nДараах зүйлсийг хийж болно:\n1. CV-гээ шалгаад дахин оролдох\n2. Хэдэн минут хүлээгээд дахин оролдох\n3. Чат функцээр CV-гээ дэлгэрэнгүй шинжилгээ хийх`
      );
    } finally {
      setUploading(false);
    }
  };

  if (!session) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        Please sign in to upload your CV
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Upload your CV (PDF or Word)
        </label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`w-full py-2 px-4 rounded-lg text-white font-medium
            ${
              uploading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {uploading ? "Uploading..." : "Upload CV"}
        </button>
      )}

      {analysis && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            CV Analysis Results
          </h3>
          <div className="prose prose-sm max-w-none text-black">
            {analysis.split("\n").map((line, index) => (
              <p key={index} className="mb-2">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {noMatches && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            No Matching Jobs Found
          </h3>
          <p className="text-yellow-700">
            We couldn't find any jobs that match your CV. This could be because:
          </p>
          <ul className="list-disc list-inside mt-2 text-yellow-700">
            <li>Your skills might not match current job requirements</li>
            <li>There might not be any relevant jobs posted yet</li>
            <li>
              Try updating your CV with more relevant skills and experience
            </li>
          </ul>
        </div>
      )}

      {jobMatches.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Job Matches
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobMatches.map((match) => (
              <div
                key={match.job.id}
                className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {match.job.title}
                    </h4>
                    <p className="text-md text-gray-600 line-clamp-1">
                      {match.job.company.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {match.job.location}
                    </p>
                    {match.job.salary && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {match.job.salary}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(match.matchScore)}%
                    </div>
                    <div className="ml-2 text-sm text-gray-500">match</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Experience</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${match.matchDetails.experience}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {Math.round(match.matchDetails.experience)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Skills</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${match.matchDetails.skills}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {Math.round(match.matchDetails.skills)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Education</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${match.matchDetails.education}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {Math.round(match.matchDetails.education)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
