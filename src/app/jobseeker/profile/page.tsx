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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-10">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        {/* Зүүн багана: Хувийн мэдээлэл */}
        <div className="md:w-1/2 w-full flex flex-col items-center">
          <div className="w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center mb-8 border border-gray-100 relative transition hover:shadow-2xl">
            {/* Профайл зураг эсвэл icon */}
            <div className="w-28 h-28 mb-4 flex items-center justify-center bg-gray-100 rounded-full shadow-inner border-4 border-white">
              {user.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt="Profile Picture"
                  width={112}
                  height={112}
                  className="rounded-full object-cover w-full h-full"
                />
              ) : (
                <UserCircleIcon className="h-24 w-24 text-gray-400" />
              )}
            </div>
            <h2 className="font-bold text-2xl mb-4 text-black tracking-tight">{user.name}</h2>
            <div className="w-full flex flex-col gap-3 mb-4">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 01-8 0m8 0V8a4 4 0 00-8 0v4m8 0a4 4 0 01-8 0m8 0v4a4 4 0 01-8 0v-4" /></svg>
                <span className="text-black text-base">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.48 19h9.04a2 2 0 001.83-1.3L17 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" /></svg>
                <span className="text-black text-base">{user.phoneNumber}</span>
              </div>
            </div>
            <button className="mt-2 px-8 py-2 bg-[#0a1931] text-white rounded-lg font-semibold shadow hover:bg-[#185adb] transition text-black w-full">
              CV Хадгалах
            </button>
            <Link
              href="/jobseeker/profile/edit"
              className="mt-4 flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full font-semibold shadow-lg hover:from-indigo-600 hover:to-blue-600 transition text-base w-full max-w-xs"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h18" /></svg>
              Профайл засах
            </Link>
          </div>
        </div>

        {/* Баруун багана: CV жагсаалт */}
        <div className="md:w-1/2 w-full">
          <h2 className="font-bold text-lg mb-6 text-black">Оруулсан CV-үүд</h2>
          <div className="flex flex-col gap-4 max-h-[40rem] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-xl">
            {user.cvs && user.cvs.length > 0 ? (
              user.cvs.map((cv: any) => (
                <div
                  key={cv.id}
                  className="bg-white rounded-xl p-6 shadow-md flex flex-col sm:flex-row justify-between items-center text-black border border-gray-100 hover:shadow-xl transition"
                >
                  <div>
                    <div className="font-semibold text-base text-black">{cv.fileName}</div>
                    <div className="text-xs text-gray-500 mt-1 text-black">
                      Огноо: {new Date(cv.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button className="mt-2 sm:mt-0 px-5 py-2 bg-[#0a1931] text-white rounded-lg font-semibold shadow hover:bg-[#185adb] transition text-black">
                    Татах
                  </button>
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
