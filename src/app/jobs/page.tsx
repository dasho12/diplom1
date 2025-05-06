import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import JobsList from "@/components/JobsList";

export default async function JobsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen mt-16 bg-gray-50">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Filters, Search, Job List */}
          <div>
            <JobsList />
          </div>
          {/* Right: Job Details (placeholder for now) */}
          <div className="hidden lg:block">
            <div className="bg-white shadow rounded-lg p-8 min-h-[500px] flex items-center justify-center text-gray-400">
              Ажлын байр сонгогдоогүй байна
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
