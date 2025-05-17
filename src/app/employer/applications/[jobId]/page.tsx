"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface JobApplication {
  id: string;
  createdAt: string;
  status: string;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  cv: {
    id: string;
    fileName: string;
    fileUrl: string;
  } | null;
}

export default function EmployerJobApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const jobId = Array.isArray(params?.jobId) ? params.jobId[0] : params?.jobId;
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 3;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/employer/login");
      return;
    }
    if (status === "authenticated" && session?.user && jobId) {
      fetchApplications();
    }
    // eslint-disable-next-line
  }, [session, status, jobId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/employer/applications");
      if (!response.ok) throw new Error("Өргөдлүүдийг ачаалахад алдаа гарлаа");
      const data = await response.json();
      const filtered = data.filter((app: any) => app.job.id === jobId);
      setApplications(filtered);
      setJobTitle(filtered[0]?.job?.title || "");
    } catch (e) {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(
        `/api/employer/applications/${applicationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) throw new Error("Статус шинэчлэхэд алдаа гарлаа");
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (e) {
      alert("Статус шинэчлэхэд алдаа гарлаа");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Хүлээгдэж буй";
      case "ACCEPTED":
        return "Зөвшөөрөгдсөн";
      case "REJECTED":
        return "Татгалзсан";
      default:
        return status;
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(applications.length / applicationsPerPage);
  const paginatedApps = applications.slice(
    (currentPage - 1) * applicationsPerPage,
    currentPage * applicationsPerPage
  );

  return (
    <div className="min-h-screen bg-white py-8 pt-[130px] flex flex-col items-center">
      <div className="w-full max-w-5xl px-4">
        <button
          className="mb-6 text-[#0C213A] hover:underline text-sm"
          onClick={() => router.push("/employer/applications")}
        >
          ← Бүх ажлын байр руу буцах
        </button>
        <div className="flex items-center gap-4 mb-6">
          <Image
            src="/icons/application.svg"
            alt="Application"
            width={40}
            height={40}
          />
          <div>
            <h1 className="text-[#0C213A] text-2xl font-bold font-poppins">
              {jobTitle || "Ажлын байр"} - ирсэн анкетууд
            </h1>
            <p className="mt-1 text-[#0C213A]/60 text-[14px] font-poppins">
              Нийт {applications.length} өргөдөл
            </p>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-10 text-[#0C213A]">
            Ачааллаж байна...
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            Өргөдөл байхгүй байна
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedApps.map((application) => (
                <div
                  key={application.id}
                  className="border border-[#0C213A]/10 rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2 hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <h4 className="font-bold text-[#0C213A] text-base">
                        {application.user?.name}
                      </h4>
                      <span className="text-sm text-[#0C213A]/70">
                        {application.user?.email}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {getStatusText(application.status)}
                      </span>
                      <span className="text-xs text-[#0C213A]/50">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {application.status === "PENDING" && (
                      <div className="flex gap-2 mt-1 md:mt-0">
                        <button
                          onClick={() =>
                            handleStatusChange(application.id, "ACCEPTED")
                          }
                          className="px-3 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors font-thin shadow flex items-center"
                        >
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Зөвшөөрөх
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(application.id, "REJECTED")
                          }
                          className="px-3 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors font-thin shadow flex items-center"
                        >
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Татгалзах
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-1">
                    <div className="flex-1">
                      {application.message && (
                        <div className="mb-1">
                          <span className="block text-[#0C213A] text-sm font-semibold mb-0.5">
                            Нэмэлт мэдээлэл:
                          </span>
                          <p className="text-[#0C213A]/90 text-sm bg-white rounded p-2">
                            {application.message}
                          </p>
                        </div>
                      )}
                    </div>
                    {application.cv && (
                      <a
                        href={application.cv.fileUrl}
                        download
                        className="mt-1 inline-flex items-center text-xs text-[#0C213A] hover:text-[#0C213A]/80"
                      >
                        <svg
                          className="h-3 w-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        CV татах
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-full border text-sm font-semibold bg-gray-100 text-[#0C213A] disabled:opacity-50"
                >
                  «
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-full border text-sm font-semibold transition-all duration-150
                      ${
                        currentPage === i + 1
                          ? "bg-[#0C213A] text-white border-[#0C213A]"
                          : "bg-white text-[#0C213A] border-gray-200 hover:bg-gray-100"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-full border text-sm font-semibold bg-gray-100 text-[#0C213A] disabled:opacity-50"
                >
                  »
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
