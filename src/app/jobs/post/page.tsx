import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import JobInput from "@/components/JobInput";
import Link from "next/link";

export default async function PostJobPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Link 
            href="/jobs" 
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Буцах
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Шинэ ажлын байр оруулах
          </h1>
          <p className="text-lg text-gray-600">
            Ажлын байрны мэдээллийг бөглөнө үү
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <JobInput />
        </div>
      </main>
    </div>
  );
} 