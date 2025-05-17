"use client";

import { useState } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import JobsList from "@/components/JobsList";
import JobDetails from "@/components/JobDetails";
import { JSX } from "react";

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
  type: string;
}

export default function JobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  return (
    <div className="min-h-screen pt-16 bg-white px-32">
      <main className="py-12">
        <div className="grid grid-cols-5 gap-8">
          {/* Left: Filters, Search, Job List */}
          <div className="col-span-2">
            <JobsList onJobSelect={setSelectedJob} />
          </div>
          {/* Right: Job Details */}
          <div className="hidden lg:block col-span-3">
            {selectedJob ? (
              <JobDetails job={selectedJob} />
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ажлын байр сонгоно уу
                </h3>
                <p className="text-gray-500">
                  Дэлгэрэнгүй мэдээллийг харахын тулд ажлын байрыг сонгоно уу
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
