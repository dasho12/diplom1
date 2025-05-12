import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import ProfileCVUpload from "@/components/ProfileCVUpload";

export default async function JobseekerProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "USER") {
    redirect("/login?error=Unauthorized");
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
          fileUrl: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  }) as any;

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p>Could not find user profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] bg-gradient-to-b from-[#f8fafc] to-[#e8ecf3] flex flex-col items-center justify-start py-16">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-12 items-start justify-center">
        {/* Зүүн багана: Хувийн мэдээлэл */}
        <div className="md:w-1/2 w-full flex flex-col items-center">
          <div className="w-full bg-white/95 rounded-3xl shadow-2xl p-12 flex flex-col items-center mb-8 border-2 border-gray-200 relative transition hover:shadow-2xl hover:-translate-y-1 duration-200">
            {/* Профайл зураг эсвэл icon */}
            <div className="w-32 h-32 mb-6 flex items-center justify-center bg-gray-100 rounded-full shadow-inner border-4 border-white">
              {user.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt="Profile Picture"
                  width={128}
                  height={128}
                  className="rounded-full object-cover w-full h-full"
                />
              ) : (
                <UserCircleIcon className="h-28 w-28 text-gray-400" />
              )}
            </div>
            <h2 className="font-bold text-3xl mb-6 text-black tracking-tight text-center">{user.name}</h2>
            <div className="w-full flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-5 py-3 shadow-sm">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 01-8 0m8 0V8a4 4 0 00-8 0v4m8 0a4 4 0 01-8 0m8 0v4a4 4 0 01-8 0v-4" /></svg>
                <span className="text-black text-lg">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-5 py-3 shadow-sm">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.48 19h9.04a2 2 0 001.83-1.3L17 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" /></svg>
                <span className="text-black text-lg">{user.phoneNumber}</span>
              </div>
            </div>
            <div className="mt-2 w-full">
              <ProfileCVUpload />
            </div>
            <Link
              href="/jobseeker/profile/edit"
              className="mt-6 flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full font-semibold shadow-lg hover:from-indigo-600 hover:to-blue-600 transition text-lg w-full max-w-xs"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h18" /></svg>
              Профайл засах
            </Link>
          </div>
        </div>

        {/* Баруун багана: CV жагсаалт */}
        <div className="md:w-1/2 w-full">
          <div className="flex flex-col gap-6 max-h-[40rem] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-2xl">
            {user.cvs && user.cvs.length > 0 ? (
              user.cvs.map((cv: any) => (
                <div
                  key={cv.id}
                  className="bg-white rounded-2xl p-7 shadow-lg flex flex-col sm:flex-row justify-between items-center text-black border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition duration-200"
                >
                  <div>
                    <div className="font-semibold text-base text-black">{cv.fileName}</div>
                    <div className="text-xs text-gray-500 mt-1 text-black">
                      Огноо: {new Date(cv.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {cv.fileUrl ? (
                    <a
                      href={cv.fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 sm:mt-0 px-5 py-2 bg-[#0a1931] text-white rounded-lg font-semibold shadow hover:bg-[#185adb] transition text-black text-center"
                    >
                      Татах
                    </a>
                  ) : (
                    <button
                      className="mt-2 sm:mt-0 px-5 py-2 bg-gray-300 text-white rounded-lg font-semibold shadow cursor-not-allowed text-black"
                      disabled
                    >
                      Татах
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-5 shadow text-center text-gray-500 text-black">
                CV оруулаагүй байна.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
