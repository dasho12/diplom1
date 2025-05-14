"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon, BriefcaseIcon } from "@heroicons/react/24/solid";
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
        const newApplications = data.filter(app => app.status === 'PENDING' && !app.viewedAt);
        if (newApplications.length > 0) {
          // Group applications by job
          const applicationsByJob = newApplications.reduce<JobApplications>((acc, app) => {
            if (!acc[app.job.id]) {
              acc[app.job.id] = {
                title: app.job.title,
                count: 0
              };
            }
            acc[app.job.id].count++;
            return acc;
          }, {});

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
            <p className="mt-4 text-[#0C213A] text-[16px] font-poppins">Ачааллаж байна...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
          <div className="space-y-4">
            {jobs.map(([jobId, { title, applications }]) => (
              <Disclosure key={jobId}>
                {({ open }) => (
                  <div className="bg-white rounded-lg shadow">
                    <Disclosure.Button className="flex w-full justify-between rounded-lg px-4 py-4 text-left text-sm font-medium focus:outline-none focus-visible:ring focus-visible:ring-[#0C213A] focus-visible:ring-opacity-75">
                      <div className="flex items-center">
                        <BriefcaseIcon className="h-5 w-5 text-[#0C213A]/60 mr-2" />
                        <span className="text-[#0C213A]">{title}</span>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0C213A]/10 text-[#0C213A]">
                          {applications.length} өргөдөл
                        </span>
                      </div>
                      <ChevronUpIcon
                        className={`${
                          open ? "rotate-180 transform" : ""
                        } h-5 w-5 text-[#0C213A]/60`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pb-4 pt-2 text-sm text-gray-500">
                      <div className="space-y-4">
                        {applications.map((application) => (
                          <div
                            key={application.id}
                            className="border rounded-lg p-4 hover:bg-gray-50"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-[#0C213A]">
                                  {application.user.name}
                                </h4>
                                <p className="text-sm text-[#0C213A]/60">
                                  {application.user.email}
                                </p>
                              </div>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  application.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : application.status === "ACCEPTED"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {application.status === "PENDING"
                                  ? "Хүлээгдэж буй"
                                  : application.status === "ACCEPTED"
                                  ? "Зөвшөөрөгдсөн"
                                  : "Татгалзсан"}
                              </span>
                            </div>
                            {application.message && (
                              <p className="mt-2 text-sm text-[#0C213A]/80">
                                {application.message}
                              </p>
                            )}
                            {application.cv && (
                              <a
                                href={application.cv.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center text-sm text-[#0C213A] hover:text-[#0C213A]/80"
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
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                CV татах
                              </a>
                            )}
                            {/* Approve/Reject buttons for PENDING applications */}
                            {application.status === "PENDING" && (
                              <div className="mt-4 flex gap-2">
                                <button
                                  onClick={() => handleStatusChange(application.id, "ACCEPTED")}
                                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                >
                                  Зөвшөөрөх
                                </button>
                                <button
                                  onClick={() => handleStatusChange(application.id, "REJECTED")}
                                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                >
                                  Татгалзах
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
