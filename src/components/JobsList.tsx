"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No jobs posted yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobs.map((job) => (
        <Link href={`/jobs/${job.id}`} key={job.id}>
          <div className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-md text-gray-600 line-clamp-1">
                  {job.company.name}
                </p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                  {job.location}
                </p>
                {job.salary && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {job.salary}
                  </p>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-3">
              <p className="text-sm text-gray-600 line-clamp-2">
                {job.description}
              </p>
            </div>

            <div className="mt-3">
              <p className="text-sm text-gray-600 line-clamp-2">
                {job.requirements}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
