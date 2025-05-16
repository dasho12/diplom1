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
      const companyRes = await fetch("/api/employer/company");
      const companyData = await companyRes.json();
      setCompany(companyData);
      const jobsRes = await fetch("/api/employer/jobs");
      const jobsData = await jobsRes.json();
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Энэ ажлын байрыг устгахдаа итгэлтэй байна уу?")) {
      try {
        const response = await fetch(`/api/employer/jobs/${jobId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setJobs(jobs.filter((job) => job.id !== jobId));
        } else {
          alert("Ажлын байрыг устгахад алдаа гарлаа");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Ажлын байрыг устгахад алдаа гарлаа");
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
    <div className="min-h-screen bg-white pt-30 px-0 md:px-32 text-[#0C213A] font-poppins">
      {/* Header хэсэг */}
      <div className="bg-white shadow-sm rounded-b-xl px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 relative rounded-md bg-gray-100 overflow-hidden">
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
            <div className="text-2xl font-bold text-[#0C213A]">{company?.name || 'Таны компанийн нэр'}</div>
            <div className="flex flex-wrap gap-4 text-slate-600 text-sm mt-1 items-center">
              <span className="flex items-center gap-2">
                <Image src="/icons/mail.svg" alt="email icon" width={20} height={20} />
                {session?.user?.email || 'info@company.mn'}
              </span>
              <span>|</span>
              <span className="flex items-center gap-2">
                <Image src="/icons/phone.svg" alt="phone icon" width={20} height={20} />
                90099810
              </span>
              <span>|</span>
              <span className="flex items-center gap-2">
                <Image src="/icons/location2.svg" alt="location icon" width={20} height={20} />
                {company?.location || 'Улаанбаатар, Монгол'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            href="/employer/post-job"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          >
            Ажлын байр нийтлэх
          </Link>
        </div>
      </div>

      {/* Posted Jobs Section */}
      <main className="mx-auto py-15">
        <h2 className="text-2xl font-bold mb-8 text-[#0C213A] flex items-center gap-2">
          <Image src="/icons/resume2.svg" alt="resume icon" width={100} height={100} />
          Нийтэлсэн ажлын байрууд
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">Одоогоор ажлын байр нийтлээгүй байна.</div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(12,33,58,0.08)] p-5 flex flex-col gap-2 group relative transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgba(12,33,58,0.12)]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 relative rounded bg-gray-100 overflow-hidden">
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
                  <div className="text-base font-semibold text-[#0C213A]">{company?.name}</div>
                  <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1
                    ${job.type === 'FULL_TIME' ? 'bg-green-50 text-green-700' : ''}
                    ${job.type === 'PART_TIME' ? 'bg-yellow-50 text-yellow-700' : ''}
                    ${job.type === 'CONTRACT' ? 'bg-blue-50 text-blue-700' : ''}
                    ${job.type === 'INTERNSHIP' ? 'bg-purple-50 text-purple-700' : ''}
                  `}>
                    <svg className={`w-4 h-4
                      ${job.type === 'FULL_TIME' ? 'text-green-600' : ''}
                      ${job.type === 'PART_TIME' ? 'text-yellow-500' : ''}
                      ${job.type === 'CONTRACT' ? 'text-blue-500' : ''}
                      ${job.type === 'INTERNSHIP' ? 'text-purple-500' : ''}
                    `} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    {job.type === 'FULL_TIME' && 'БҮТЭН ЦАГ'}
                    {job.type === 'PART_TIME' && 'ЦАГИЙН'}
                    {job.type === 'CONTRACT' && 'ГЭРЭЭТ'}
                    {job.type === 'INTERNSHIP' && 'ДАДЛАГА'}
                  </span>
                </div>
                <div className="text-lg font-bold text-[#0C213A] mb-1">{job.title}</div>
                <div className="flex justify-between items-center gap-4 mt-1 mb-2">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Image src="/icons/location2.svg" alt="location icon" width={20} height={20} />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-base font-thin text-[#0C213A]">
                    {job.salary ? <><Image src="/icons/wallet.svg" alt="wallet icon" width={20} height={20} className="inline-block" /> <span className="font-thin" style={{color:'#0C213A'}}>{job.salary}</span></> : 'Цалин тохиролцоно'}
                  </div>
                </div>
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Link
                    href={`/employer/jobs/${job.id}/edit`}
                    className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition"
                    title="Засах"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 1 1 2.97 2.97L7.5 19.789l-4 1 1-4 13.362-13.302z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition"
                    title="Устгах"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
