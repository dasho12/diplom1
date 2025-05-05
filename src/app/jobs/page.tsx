import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import JobsList from "@/components/JobsList";
import Link from "next/link";
import JobInput from "@/components/JobInput";

export default async function JobsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
          <JobInput/>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Ажлын байрны жагсаалт
            </h1>
            <p className="text-lg text-gray-600">
              Бүх ажлын байрны жагсаалт
            </p>
          </div>
          <Link 
            href="/jobs/post" 
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Шинэ ажлын байр оруулах
           
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <JobsList />
        </div>
      </main>
    </div>
  );
}
