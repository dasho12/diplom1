"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useNotification } from "@/providers/NotificationProvider";

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

interface JobApplications {
  [jobId: string]: {
    title: string;
    count: number;
  };
}

export default function EmployerApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();
  const hasShownNotification = useRef(false);

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

        // Mark applications as viewed first
        try {
          await fetch("/api/employer/applications/mark-viewed", {
            method: "POST",
          });
        } catch (err) {
          console.error("Error marking applications as viewed:", err);
        }

        // Check for new applications after marking as viewed
        const newApplications = data.filter(
          (app) => app.status === "PENDING" && !app.viewedAt
        );
        if (newApplications.length > 0) {
          // Group applications by job
          const applicationsByJob = newApplications.reduce<JobApplications>(
            (acc, app) => {
              if (!acc[app.job.id]) {
                acc[app.job.id] = {
                  title: app.job.title,
                  count: 0,
                };
              }
              acc[app.job.id].count++;
              return acc;
            },
            {}
          );

          // Show notifications for each job
          Object.values(applicationsByJob).forEach(({ title, count }) => {
            addNotification(
              `${title} ажлын байрт ${count} шинэ өргөдөл ирлээ`,
              "info",
              count
            );
          });
        }
      } else {
        throw new Error("Буруу өгөгдөл ирлээ");
      }
    } catch (err: any) {
      console.error("Error in fetchApplications:", err);
      // Remove addNotification here as well
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
      addNotification(err.message, "error");
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
            <p className="mt-4 text-[#0C213A] text-[16px] font-poppins">
              Ачааллаж байна...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 pt-[130px]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-6 mb-12">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0C213A]/5 shadow-inner">
            <Image
              src="/icons/application.svg"
              alt="Application"
              width={48}
              height={48}
              className="p-2"
            />
          </div>
          <div>
            <h1 className="text-[#0C213A] text-3xl font-bold font-poppins">
              Ирсэн өргөдлүүд
            </h1>
            <p className="mt-2 text-[#0C213A]/60 text-[16px] font-poppins">
              Нийт {applications.length} өргөдөл
            </p>
          </div>
        </div>
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0C213A]/5 mb-6">
              <svg
                className="h-10 w-10 text-[#0C213A]/30"
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
            </div>
            <h3 className="text-[#0C213A] text-xl font-semibold font-poppins mb-2">
              Өргөдөл байхгүй байна
            </h3>
            <p className="text-[#0C213A]/60 text-base font-poppins">
              Одоогоор ирсэн өргөдөл байхгүй байна.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {jobs.map(([jobId, { title, applications }]) => (
              <div
                key={jobId}
                className="relative bg-white rounded-3xl shadow-xl border border-gray-100 cursor-pointer hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center group hover:-translate-y-1"
                onClick={() => router.push(`/employer/applications/${jobId}`)}
              >
                <div className="absolute top-6 right-6">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-[#0C213A] text-white shadow">
                    {applications.length} өргөдөл
                  </span>
                </div>
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0C213A]/5 mb-6 shadow-inner">
                  <Image
                    src="/icons/application.svg"
                    alt="Application"
                    width={36}
                    height={36}
                    className="p-1"
                  />
                </div>
                <div className="text-center w-full">
                  <div className="text-xl font-extrabold text-[#0C213A] mb-3 truncate">
                    {title}
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-500 gap-2 mb-6">
                    <svg
                      className="w-4 h-4 text-[#0C213A]/40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      Сүүлд ирсэн:{" "}
                      {applications[0]?.createdAt
                        ? new Date(
                            applications[0].createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>
                <button className="mt-auto w-full py-3 rounded-xl bg-[#0C213A] text-white font-bold shadow hover:bg-[#0C213A]/90 transition-all duration-300">
                  Дэлгэрэнгүй харах
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
