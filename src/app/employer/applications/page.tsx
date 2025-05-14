"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon, BriefcaseIcon } from "@heroicons/react/24/solid";

interface JobApplication {
  id: string;
  createdAt: string;
  status: string;
  message: string;
  job: {
    id: string;
    title: string;
  };
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

export default function EmployerApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("User is not authenticated, redirecting to login");
      router.push("/employer/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      fetchApplications();
    }
  }, [session, status, router]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching applications...");

      const response = await fetch("/api/employer/applications");
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Өргөдлүүдийг ачаалахад алдаа гарлаа"
        );
      }

      const data = await response.json();
      console.log("Received applications:", data);

      if (Array.isArray(data)) {
        setApplications(data);
      } else {
        throw new Error("Буруу өгөгдөл ирлээ");
      }

      // Mark applications as viewed
      try {
        await fetch("/api/employer/applications/mark-viewed", {
          method: "POST",
        });
      } catch (err) {
        console.error("Error marking applications as viewed:", err);
      }
    } catch (err: any) {
      console.error("Error in fetchApplications:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Group applications by job
  const jobsMap: {
    [jobId: string]: { title: string; applications: JobApplication[] };
  } = {};
  applications.forEach((app) => {
    if (!jobsMap[app.job.id]) {
      jobsMap[app.job.id] = { title: app.job.title, applications: [] };
    }
    jobsMap[app.job.id].applications.push(app);
  });
  const jobs = Object.entries(jobsMap);

  const handleStatusChange = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      setError(null);
      const response = await fetch(
        `/api/employer/applications/${applicationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Статус шинэчлэхэд алдаа гарлаа");
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err: any) {
      console.error("Error updating status:", err);
      setError(err.message);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full h-screen relative bg-white overflow-hidden">
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0C213A]"></div>
            <p className="mt-4 text-[#0C213A] text-[16px] font-poppins">Ачааллаж байна...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full h-screen relative bg-white overflow-hidden">
          <div className="absolute left-1/2 top-[100px] transform -translate-x-1/2">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
              <p className="text-red-600 text-[16px] font-poppins">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full h-screen relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-[#0C213A] text-[24px] font-bold font-poppins">
                Ирсэн өргөдлүүд
              </h1>
              <p className="mt-1 text-[#0C213A]/60 text-[14px] font-poppins">
                Нийт {applications.length} өргөдөл
              </p>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-6">
              <svg
                className="mx-auto h-10 w-10 text-[#0C213A]/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-[#0C213A] text-[18px] font-semibold font-poppins">
                Өргөдөл байхгүй байна
              </h3>
              <p className="mt-1 text-[#0C213A]/60 text-[14px] font-poppins">
                Одоогоор ирсэн өргөдөл байхгүй байна.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-[10px] overflow-hidden">
              <ul className="divide-y divide-[#0C213A]/10">
                {jobs.map(([jobId, job]) => (
                  <li key={jobId} className="mb-3">
                    <Disclosure>
                      {({ open }) => (
                        <div className="rounded-[10px] shadow-lg bg-gradient-to-r from-[#0C213A]/5 to-[#0C213A]/10 border border-[#0C213A]/20">
                          <Disclosure.Button className="w-full flex items-center justify-between px-6 py-4 rounded-[10px] focus:outline-none transition group">
                            <div className="flex items-center gap-3">
                              <BriefcaseIcon className="h-6 w-6 text-[#0C213A]" />
                              <span className="text-[#0C213A] text-[16px] font-bold font-poppins group-hover:text-[#0C213A]/80 transition">
                                {job.title}
                              </span>
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-[#0C213A]/10 text-[#0C213A] text-[12px] font-semibold font-poppins">
                                {job.applications.length} өргөдөл
                              </span>
                            </div>
                            <ChevronUpIcon
                              className={`${
                                open ? "rotate-180" : "rotate-0"
                              } h-5 w-5 text-[#0C213A] transition-transform`}
                            />
                          </Disclosure.Button>
                          <Disclosure.Panel className="px-6 pb-4 pt-2 bg-white rounded-b-[10px] border-t border-[#0C213A]/10">
                            {job.applications.length === 0 ? (
                              <div className="text-[#0C213A]/60 text-[14px] font-poppins py-2">
                                Өргөдөл байхгүй
                              </div>
                            ) : (
                              <ul className="divide-y divide-[#0C213A]/10">
                                {job.applications.map((application) => (
                                  <li
                                    key={application.id}
                                    className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[#0C213A] text-[14px] font-semibold font-poppins">
                                          {application.user.name || application.user.email}
                                        </span>
                                        <span className="ml-2 text-[#0C213A]/60 text-[12px] font-poppins">
                                          {application.user.email}
                                        </span>
                                        <span
                                          className={`ml-2 px-2 py-0.5 rounded-full text-[12px] font-poppins ${getStatusColor(
                                            application.status
                                          )}`}
                                        >
                                          {getStatusText(application.status)}
                                        </span>
                                      </div>
                                      <div className="mt-1 flex items-center text-[#0C213A]/60 text-[12px] font-poppins">
                                        <svg
                                          className="flex-shrink-0 mr-1.5 h-4 w-4"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        {new Date(application.createdAt).toLocaleDateString()}
                                      </div>
                                      {application.message && (
                                        <p className="mt-1 text-[#0C213A]/60 text-[12px] font-poppins">
                                          {application.message}
                                        </p>
                                      )}
                                    </div>
                                    <div className="ml-3 flex-shrink-0 flex flex-col items-end space-y-2">
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() =>
                                            handleStatusChange(
                                              application.id,
                                              "ACCEPTED"
                                            )
                                          }
                                          disabled={
                                            application.status === "ACCEPTED"
                                          }
                                          className={`px-3 py-1.5 rounded-[10px] font-poppins text-[12px] shadow transition
                                            ${
                                              application.status === "ACCEPTED"
                                                ? "bg-green-100 text-green-700 cursor-not-allowed"
                                                : "bg-green-500 text-white hover:bg-green-600"
                                            }`}
                                        >
                                          Зөвшөөрөх
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleStatusChange(
                                              application.id,
                                              "REJECTED"
                                            )
                                          }
                                          disabled={
                                            application.status === "REJECTED"
                                          }
                                          className={`px-3 py-1.5 rounded-[10px] font-poppins text-[12px] shadow transition
                                            ${
                                              application.status === "REJECTED"
                                                ? "bg-red-100 text-red-700 cursor-not-allowed"
                                                : "bg-red-500 text-white hover:bg-red-600"
                                            }`}
                                        >
                                          Татгалзах
                                        </button>
                                      </div>
                                      {application.cv && (
                                        <a
                                          href={application.cv.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-[12px] font-poppins rounded-[10px] text-white bg-[#0C213A] hover:bg-[#0C213A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C213A] shadow"
                                        >
                                          <svg
                                            className="mr-1.5 h-3.5 w-3.5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                          CV харах
                                        </a>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </Disclosure.Panel>
                        </div>
                      )}
                    </Disclosure>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
