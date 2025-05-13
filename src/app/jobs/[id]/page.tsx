"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ApplyJobModal from "@/components/ApplyJobModal";

interface CV {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  status: string;
  matchScore?: number;
}

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary?: string;
  type: string;
  company: {
    name: string;
  };
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [cvs, setCVs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("User is not authenticated, redirecting to login");
      router.push("/login");
    } else if (status === "authenticated") {
      console.log("User is authenticated, fetching data");
      fetchJobDetails();
      fetchCVs();
    }
  }, [status]);

  const fetchJobDetails = async () => {
    try {
      console.log("Fetching job details for ID:", params.id);
      const response = await fetch(`/api/jobs/${params.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch job details");
      }
      const data = await response.json();
      console.log("Job details received:", data);
      setJob(data);
    } catch (error) {
      console.error("Error fetching job details:", error);
      setError("Ажлын мэдээллийг ачаалахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const fetchCVs = async () => {
    try {
      console.log("Fetching user CVs");
      const response = await fetch("/api/user/cvs");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch CVs");
      }
      const data = await response.json();
      console.log("CVs received:", data);
      setCVs(data);
    } catch (error) {
      console.error("Error fetching CVs:", error);
    }
  };

  const handleApply = async (cvId: string) => {
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/jobs/${params.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Илгээхэд алдаа гарлаа");
      }
      setMessage("CV амжилттай илгээгдлээ!");
    } catch (e: any) {
      setMessage(e.message || "Алдаа гарлаа");
      throw e;
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Ачаалж байна...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Ажил олдсонгүй</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {job.title}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {job.company.name} • {job.location}
                </p>
              </div>
              {session?.user && (
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Өргөдөл гаргах
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Ажлын төрөл
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{job.type}</dd>
              </div>
              {job.salary && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Цалин</dt>
                  <dd className="mt-1 text-sm text-gray-900">{job.salary}</dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Тайлбар</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {job.description}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>

      <ApplyJobModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onApply={handleApply}
        cvs={cvs}
        jobTitle={job.title}
      />

      {message && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4">
          <p className="text-sm text-blue-700">{message}</p>
        </div>
      )}
    </div>
  );
}
