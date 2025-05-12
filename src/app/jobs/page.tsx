"use client";

import { useState } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import JobsList from "@/components/JobsList";
import JobDetails from "@/components/JobDetails";

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

export default function JobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  return (
    <div className="min-h-screen mt-16 bg-gray-50">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Filters, Search, Job List */}
          <div>
            <JobsList onJobSelect={setSelectedJob} />
          </div>
          {/* Right: Job Details */}
          <div className="hidden lg:block">
            <JobDetails job={selectedJob} />
          </div>
        </div>
      </main>
    </div>
  );
}
