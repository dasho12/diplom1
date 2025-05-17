"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logoUrl?: string;
  };
  description: string;
  requirements: string;
  location: string;
  salary?: string;
  type: string;
  createdAt: string;
}

const MONGOLIA_PROVINCES = [
  "Улаанбаатар",
  "Архангай аймаг",
  "Баян-Өлгий аймаг",
  "Баянхонгор аймаг",
  "Булган аймаг",
  "Говь-Алтай аймаг",
  "Говьсүмбэр аймаг",
  "Дархан-Уул аймаг",
  "Дорноговь аймаг",
  "Дорнод аймаг",
  "Дундговь аймаг",
  "Завхан аймаг",
  "Орхон аймаг",
  "Өвөрхангай аймаг",
  "Өмнөговь аймаг",
  "Сүхбаатар аймаг",
  "Сэлэнгэ аймаг",
  "Төв аймаг",
  "Увс аймаг",
  "Ховд аймаг",
  "Хөвсгөл аймаг",
  "Хэнтий аймаг",
];

const FILTERS = [
  { label: "Бүтэн цагийн", icon: "⏰", type: "FULL_TIME" },
  { label: "Хагас цагийн", icon: "⏰", type: "PART_TIME" },
  { label: "Гэрээт", icon: "📝", type: "CONTRACT" },
  { label: "Дадлага", icon: "🎓", type: "INTERNSHIP" },
];

interface JobsListProps {
  onJobSelect: (job: Job | null) => void;
}

export default function JobsList({ onJobSelect }: JobsListProps) {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedProvince, setSelectedProvince] = useState(
    searchParams.get("city") || ""
  );
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch jobs");
      }

      setJobs(data);

      // If there's a selected job in the URL, find and select it
      const selectedJobId = searchParams.get("selectedJob");
      if (selectedJobId) {
        const job = data.find((j: Job) => j.id === selectedJobId);
        if (job) {
          setSelectedJob(job);
          onJobSelect(job);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  // Dummy filter logic for UI only
  const toggleFilter = (label: string) => {
    setActiveFilters((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesProvince =
      !selectedProvince || job.location.includes(selectedProvince);

    // Apply job type filters
    const matchesType =
      activeFilters.length === 0 ||
      activeFilters.some((filter) => {
        const filterType = FILTERS.find((f) => f.label === filter)?.type;
        return filterType ? job.type === filterType : true;
      });

    return matchesSearch && matchesProvince && matchesType;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        {FILTERS.map((filter) => (
          <button
            key={filter.label}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors
              ${
                activeFilters.includes(filter.label)
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }
            `}
            onClick={() => toggleFilter(filter.label)}
          >
            <span>{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>
      {/* Search and select in a row */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Мэргэжил хайх..."
          className="flex-[2] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 hover:border-slate-900 focus:border-slate-900 font-medium text-gray-900 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="relative w-60">
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-slate-400 hover:border-slate-900 focus:border-slate-900 font-medium text-gray-500 text-sm appearance-none"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
          >
            <option value="">Хот сонгох</option>
            {MONGOLIA_PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
          {/* Custom dropdown icon */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <img src="/icons/sum.svg" alt="Dropdown" className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
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
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
            />
          </svg>
        </button>
      </div>
      {/* Job cards vertical list */}
      <div className="h-[calc(100vh-18rem)] overflow-y-auto pr-4 scrollbar-hide">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Ажлын байр олдсонгүй.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredJobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              return (
                <div
                  key={job.id}
                  className={`relative overflow-hidden bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                  onClick={() => {
                    setSelectedJob(job);
                    onJobSelect(job);
                  }}
                >
                  <div className="p-6">
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-2 items-center mb-4">
                        <span className="px-3 py-1 text-sm font-semibold text-[#0BA02C] bg-[#E7F6EA] rounded-full">
                          {job.type === 'FULL_TIME' ? 'БҮТЭН ЦАГ' : job.type === 'PART_TIME' ? 'ХАГАС ЦАГ' : job.type === 'CONTRACT' ? 'ГЭРЭЭТ' : job.type === 'INTERNSHIP' ? 'ДАДЛАГА' : job.type}
                        </span>
                        <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-900">
                          {job.salary || 'Тохиролцоно'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center pt-4 border-t border-gray-100">
                      <div className="relative mr-4">
                        <img
                          src={job.company.logoUrl || '/images/default-company-logo.svg'}
                          alt={job.company.name}
                          className="w-12 h-12 object-contain rounded-lg"
                        />
                      </div>

                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {job.company.name}
                        </h4>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <svg
                            className="w-4 h-4 mr-1 text-gray-800"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {job.location}
                        </div>
                      </div>

                      <button
                        className={`ml-4 p-2 rounded-full transition-colors duration-300 ${
                          isSelected
                            ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                        aria-label="Bookmark job"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add your save logic here
                        }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
