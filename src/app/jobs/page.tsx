import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import JobInput from '@/components/JobInput';
import JobsList from '@/components/JobsList';
import Navigation from '@/components/Navigation';

export default async function JobsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Job Management
          </h1>
          <p className="text-lg text-gray-600">
            Post new jobs and view all posted positions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Post a New Job</h2>
              <JobInput />
            </div>
          </div>
          
          <div>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Posted Jobs</h2>
              <JobsList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 