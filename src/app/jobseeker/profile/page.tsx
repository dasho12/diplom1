import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import ProfileImageUpload from '@/components/ProfileImageUpload';

export default async function JobseekerProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'USER') {
    redirect('/login?error=Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      profileImageUrl: true,
      phoneNumber: true,
      facebookUrl: true,
      cvs: {
        select: {
          id: true,
          fileName: true,
          createdAt: true,
          status: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p>Could not find user profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 md:py-12 mt-12">
      <div className="container mx-auto max-w-4xl px-4 space-y-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Ажил хайгчийн профайл</h1>

        <div className="bg-gray-200 shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
              <div className="relative flex-shrink-0 text-center">
                <div className="w-32 h-32 mx-auto relative">
                  {user.profileImageUrl ? (
                    <Image
                      src={user.profileImageUrl}
                      alt="Profile Picture"
                      width={128}
                      height={128}
                      className="rounded-full object-cover w-full h-full border-4 border-gray-100 shadow-sm"
                    />
                  ) : (
                    <UserCircleIcon className="h-32 w-32 text-gray-500" />
                  )}
                  <ProfileImageUpload userId={user.id} currentImageUrl={user.profileImageUrl}/>
                </div>
              </div>

              <div className="flex-grow text-center sm:text-left pt-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{user.name || 'Нэр'}</h2>
                <p className="text-gray-700 text-lg mb-2">{user.email}</p>
                {user.phoneNumber && (
                  <p className="text-gray-600 text-md mb-1">
                    <span className="font-medium">Утас:</span> {user.phoneNumber}
                  </p>
                )}
                {user.facebookUrl && (
                   <p className="text-gray-600 text-md mb-1">
                     <span className="font-medium">Facebook:</span>{' '}
                     <a
                        href={user.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline break-all"
                      >
                        {user.facebookUrl}
                     </a>
                  </p>
                )}
                <Link href="/jobseeker/profile/edit" className="mt-4 inline-block text-sm text-indigo-700 hover:text-indigo-900 font-medium">
                  Профайл засах
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-200 shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-700">Миний CV-нүүд</h2>
              <Link href="/aij" className="flex-shrink-0 inline-block bg-indigo-600 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150">
                Шинэ CV оруулах
              </Link>
            </div>
            {user.cvs && user.cvs.length > 0 ? (
              <ul className="space-y-4">
                {user.cvs.map((cv) => (
                  <li key={cv.id} className="p-5 border border-gray-400 rounded-lg bg-gray-200 hover:shadow-md transition duration-200 ease-in-out flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900 text-lg break-words">{cv.fileName}</p>
                      <p className="text-sm text-gray-500 mt-1">Огноо: {new Date(cv.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Төлөв: <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${cv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : cv.status === 'ANALYZED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{cv.status || 'N/A'}</span>
                      </p>
                    </div>
                    <div className="flex-shrink-0 mt-3 sm:mt-0">
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 px-4 border-2 border-dashed border-gray-400 rounded-lg">
                <p className="text-gray-600">Та CV оруулаагүй байна.</p>
                <Link href="/aij" className="mt-4 inline-block text-indigo-600 hover:underline font-medium">
                  CV оруулах
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 