"use client";

import { useState, useEffect } from "react";
import { JobCard } from "./JobCard";
import { JobListing } from "./types";

export default function JobListingSection() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await response.json();
        console.log("API Response:", data);

        // Transform the API data to match JobListing type
        const transformedJobs: JobListing[] = data.map((job: any) => {
          console.log("Job type from API:", job.type);
          return {
            title: job.title,
            type: job.type === 'FULL_TIME' ? 'БҮТЭН ЦАГ' :
                  job.type === 'PART_TIME' ? 'ЦАГИЙН' :
                  job.type === 'CONTRACT' ? 'ГЭРЭЭТ' :
                  job.type === 'INTERNSHIP' ? 'ДАДЛАГА' : 'БҮТЭН ЦАГ',
            salary: job.salary || "Цалин: Хэлэлцээрээр",
            company: {
              name: job.company.name,
              logo: job.company.logoUrl || "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/23813725c8b2f39dd1d36d4e94e16d8ab78110aa?placeholderIfAbsent=true",
              location: job.location,
            },
          };
        });

        setJobs(transformedJobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="py-24 px-4 w-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Ажлын байруудыг ачааллаж байна...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 px-4 w-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-600">Алдаа гарлаа: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-24 px-4 w-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
            Онцлох компаниуд
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Монгол улсын тэргүүний компаниудын санал болгож буй ажлын байр
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <AnimatedJobCard key={index} job={job} index={index} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium rounded-lg shadow-lg hover:from-gray-900 hover:to-black transition-all duration-300 transform hover:scale-105">
            Бүх ажлын байрыг харах
          </button>
        </div>
      </div>
    </section>
  );
}

// Animated JobCard wrapper component
const AnimatedJobCard = ({
  job,
  index,
}: {
  job: JobListing;
  index: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100 + index * 100);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <JobCard {...job} />
    </div>
  );
};
