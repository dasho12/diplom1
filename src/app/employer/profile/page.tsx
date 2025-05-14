"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Company {
  id: string;
  name: string;
  description: string;
  location: string;
  website: string;
  logoUrl?: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  type: string;
  status: string;
  createdAt: string;
}

export default function EmployerProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && !hasLoaded) {
      if (session?.user?.role === "EMPLOYER") {
        fetchCompanyAndJobs();
        setHasLoaded(true);
      } else {
        router.push("/login");
      }
    }
  }, [status, session, hasLoaded]);

  const fetchCompanyAndJobs = async () => {
    try {
      // Fetch company data
      const companyRes = await fetch("/api/employer/company");
      const companyData = await companyRes.json();
      setCompany(companyData);

      // Fetch jobs data
      const jobsRes = await fetch("/api/employer/jobs");
      const jobsData = await jobsRes.json();
      console.log("Jobs data from API:", jobsData); // Debug log
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Энэ ажлын байрыг устгахдаа итгэлтэй байна уу?')) {
      try {
        const response = await fetch(`/api/employer/jobs/${jobId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setJobs(jobs.filter(job => job.id !== jobId));
        } else {
          alert('Ажлын байрыг устгахад алдаа гарлаа');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Ажлын байрыг устгахад алдаа гарлаа');
      }
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
    <div className="min-h-screen mt-16 bg-gray-50">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Company Info and Post Job Button */}
          <div>
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-black">
                Байгууллагын мэдээлэл
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 relative rounded-lg bg-gray-100 overflow-hidden">
                  {company?.logoUrl ? (
                    <Image
                      src={company.logoUrl}
                      alt={`${company.name} logo`}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/default-company-logo.svg";
                      }}
                    />
                  ) : (
                    <Image
                      src="/images/default-company-logo.svg"
                      alt="Default company logo"
                      fill
                      className="object-contain"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                          const response = await fetch('/api/employer/upload-logo', {
                            method: 'POST',
                            body: formData,
                          });
                          if (response.ok) {
                            const data = await response.json();
                            setCompany(prev => prev ? { ...prev, logoUrl: data.imageUrl } : null);
                          } else {
                            alert('Лого хуулах үед алдаа гарлаа');
                          }
                        } catch (error) {
                          console.error('Error uploading logo:', error);
                          alert('Лого хуулах үед алдаа гарлаа');
                        }
                      }
                    }}
                  />
                  <label
                    htmlFor="logo-upload"
                    className="px-3 py-1.5 text-sm bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors cursor-pointer text-center"
                  >
                    Лого солих
                  </label>
                </div>
                <div className="space-y-3 text-black">
                  <div>
                    <span className="font-semibold">Байгууллагын нэр:</span>{" "}
                    {company?.name}
                  </div>
                  <div>
                    <span className="font-semibold">Байгууллагын Email:</span>{" "}
                    {session?.user?.email}
                  </div>
                  <div>
                    <span className="font-semibold">Холбоо барих:</span> 90099810
                  </div>
                  <div>
                    <span className="font-semibold">Хаяг:</span>{" "}
                    {company?.location}
                  </div>
                </div>
              </div>
              <Link
                href="/employer/post-job"
                className="mt-6 block w-full text-center bg-blue-900 text-white py-2 rounded-md font-medium hover:bg-blue-800 transition-colors"
              >
                Ажлын байр нийтлэх
              </Link>
            </div>
          </div>

          {/* Right: Posted Jobs */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-black">
              Нийтэлсэн ажлын байрууд
            </h2>
            <div className="flex flex-col gap-4">
              {jobs.length === 0 ? (
                <p className="text-black">
                  Одоогоор ажлын байр нийтлээгүй байна.
                </p>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 relative rounded-lg bg-gray-100 overflow-hidden">
                        {company?.logoUrl ? (
                          <Image
                            src={company.logoUrl}
                            alt={`${company.name} logo`}
                            fill
                            className="object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/default-company-logo.svg";
                            }}
                          />
                        ) : (
                          <Image
                            src="/images/default-company-logo.svg"
                            alt="Default company logo"
                            fill
                            className="object-contain"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-green-700 bg-green-50 px-2 py-1 text-xs font-semibold rounded">
                            {job.type === 'FULL_TIME' && 'Бүтэн цагийн'}
                            {job.type === 'PART_TIME' && 'Цагийн'}
                            {job.type === 'CONTRACT' && 'Гэрээт'}
                            {job.type === 'INTERNSHIP' && 'Дадлага'}
                          </span>
                          <span className="text-black text-sm">
                            Цалин: {job.salary}
                          </span>
                        </div>
                        <div className="text-black text-sm mt-1">
                          {company?.name}
                        </div>
                        <div className="text-gray-400 text-xs mt-1">
                          {job.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end md:self-auto">
                      <Link
                        href={`/employer/jobs/${job.id}/edit`}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                        title="Засах"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.789l-4 1 1-4 13.362-13.302z"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                        title="Устгах"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}