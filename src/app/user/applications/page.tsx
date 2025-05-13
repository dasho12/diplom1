"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface JobApplication {
  id: string;
  createdAt: string;
  status: string;
  message: string;
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
  cv: {
    id: string;
    fileName: string;
    fileUrl: string;
  } | null;
}

export default function UserApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);

    if (status === "unauthenticated") {
      console.log("User is not authenticated, redirecting to login");
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      console.log("User is authenticated, fetching applications");
      const fetchApplications = async () => {
        try {
          console.log("Fetching applications...");
          const response = await fetch("/api/employer/applications");
          console.log("Response status:", response.status);

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response:", errorData);
            throw new Error(
              errorData.error || "Өргөдлүүдийг ачаалахад алдаа гарлаа"
            );
          }

          const data = await response.json();
          console.log("Received applications:", data);
          setApplications(data);
        } catch (err: any) {
          console.error("Error in fetchApplications:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchApplications();
    }
  }, [session, status, router]);

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Ачааллаж байна...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          Илгээсэн өргөдлүүд
        </h1>

        {applications.length === 0 ? (
          <div className="text-center text-gray-500">
            Илгээсэн өргөдөл байхгүй байна
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {applications.map((application) => (
                <li key={application.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {application.job.title}
                        </h3>
                        <div className="mt-2 flex flex-col sm:flex-row sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {application.job.company.name}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              {new Date(
                                application.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {application.message && (
                          <p className="mt-2 text-sm text-gray-500">
                            {application.message}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0 flex flex-col items-end space-y-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {getStatusText(application.status)}
                        </span>
                        {application.cv && (
                          <a
                            href={application.cv.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            CV харах
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
