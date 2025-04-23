import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import CVUpload from '@/components/CVUpload';
import Chatbot from '@/components/Chatbot';
import Navigation from '@/components/Navigation';

export default async function Home() {
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
            CV Analysis Tool
          </h1>
          <p className="text-lg text-gray-600">
            Upload your CV and get instant analysis using AI
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <CVUpload />
          </div>
          <div>
            <Chatbot />
          </div>
        </div>
      </main>
    </div>
  );
}
