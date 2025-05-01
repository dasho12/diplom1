import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import BackButton from "@/components/BackButton";

interface JobPageProps {
  params: {
    id: string;
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const job = await prisma.job.findUnique({
    where: {
      id: params.id,
    },
    include: {
      company: true,
    },
  });

  if (!job) {
    redirect("/jobs");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-xl text-gray-600 mt-1">{job.company.name}</p>
              <p className="text-sm text-gray-500 mt-2">{job.location}</p>
              {job.salary && (
                <p className="text-sm text-gray-500 mt-1">{job.salary}</p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">Description</h2>
            <p className="mt-2 text-gray-600 whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Requirements
            </h2>
            <p className="mt-2 text-gray-600 whitespace-pre-wrap">
              {job.requirements}
            </p>
          </div>

          <div className="mt-8">
            <BackButton />
          </div>
        </div>
      </main>
    </div>
  );
}
