"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  description: string;
  location: string;
  website: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  status: string;
  createdAt: string;
}

export default function EmployerProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchCompanyAndJobs();
    }
  }, [status]);

  const fetchCompanyAndJobs = async () => {
    try {
      // Fetch company data
      const companyRes = await fetch("/api/employer/company");
      const companyData = await companyRes.json();
      setCompany(companyData);

      // Fetch jobs data
      const jobsRes = await fetch("/api/employer/jobs");
      const jobsData = await jobsRes.json();
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Ачаалж байна...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Company Information */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {company?.name}
              </h1>
              <p className="mt-2 text-gray-600">{company?.description}</p>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Байршил:</span>{" "}
                  {company?.location}
                </p>
                {company?.website && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Вэб хаяг:</span>{" "}
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      {company.website}
                    </a>
                  </p>
                )}
              </div>
            </div>
            <Link
              href="/employer/edit-profile"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Мэдээлэл засах
            </Link>
          </div>
        </div>

        {/* Job Posting Button */}
        <div className="mb-8">
          <Link
            href="/employer/post-job"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Шинэ ажлын байр нийтлэх
          </Link>
        </div>

        {/* Posted Jobs */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Нийтэлсэн ажлын байрууд
          </h2>
          <div className="space-y-6">
            {jobs.length === 0 ? (
              <p className="text-gray-500">
                Одоогоор ажлын байр нийтлээгүй байна.
              </p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="mt-2 space-x-4">
                        <span className="text-sm text-gray-500">
                          Байршил: {job.location}
                        </span>
                        {job.salary && (
                          <span className="text-sm text-gray-500">
                            Цалин: {job.salary}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            job.status === "OPEN"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {job.status === "OPEN" ? "Нээлттэй" : "Хаалттай"}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/employer/jobs/${job.id}/edit`}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Засах
                      </Link>
                      <Link
                        href={`/employer/jobs/${job.id}/applications`}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Анкетууд
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
