"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
  };
  description: string;
  requirements: string;
  location: string;
  salary?: string;
  createdAt: string;
}

const MONGOLIA_PROVINCES = [
  "Архангай",
  "Баян-Өлгий",
  "Баянхонгор",
  "Булган",
  "Говь-Алтай",
  "Говьсүмбэр",
  "Дархан-Уул",
  "Дорноговь",
  "Дорнод",
  "Дундговь",
  "Завхан",
  "Өвөрхангай",
  "Өмнөговь",
  "Сүхбаатар",
  "Сэлэнгэ",
  "Төв",
  "Увс",
  "Ховд",
  "Хөвсгөл",
  "Хэнтий",
  "Улаанбаатар",
];

const FILTERS = [
  { label: "Өндөр цалинтай", icon: "💵" },
  { label: "Алсаас", icon: "🏠" },
  { label: "Хагас цагийн", icon: "⏰" },
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
      !selectedProvince || job.location === selectedProvince;
    return matchesSearch && matchesProvince;
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
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Мэргэжил хайх..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="w-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      {filteredJobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Ажлын байр олдсонгүй.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white shadow rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => {
                setSelectedJob(job);
                onJobSelect(job);
              }}
            >
              {/* Badge */}
              <span className="px-2 py-1 text-xs font-semibold rounded bg-green-50 text-green-700 mr-2">
                БҮТЭН ЦАГ
              </span>
              {/* Logo (placeholder) */}
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/23813725c8b2f39dd1d36d4e94e16d8ab78110aa?placeholderIfAbsent=true"
                  alt="logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              {/* Job info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {job.title}
                </h3>
                <p className="text-md text-gray-600 truncate">
                  {job.company.name}
                </p>
                <p className="text-sm text-gray-500 truncate">{job.location}</p>
                {job.salary && (
                  <p className="text-sm text-gray-500 truncate">{job.salary}</p>
                )}
              </div>
              {/* Bookmark icon */}
              <button
                className="ml-2 p-2 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Bookmark job"
                tabIndex={-1}
                onClick={(e) => e.preventDefault()}
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
          ))}
        </div>
      )}
    </div>
  );
}
