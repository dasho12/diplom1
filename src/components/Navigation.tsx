"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

const EmployerMenu = ({
  newApplicationsCount,
}: {
  newApplicationsCount: number;
}) => (
  <>
    <Link
      href="/employer/profile"
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      Миний профайл
    </Link>
    <Link
      href="/employer/post-job"
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      Ажлын байр нийтлэх
    </Link>
    <Link
      href="/employer/jobs"
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      Ажлын байрууд
    </Link>
    <Link
      href="/employer/applications"
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 relative"
    >
      Анкетууд
      {newApplicationsCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
          {newApplicationsCount}
        </span>
      )}
    </Link>
  </>
);

const UserMenu = ({
  newApplicationsCount,
}: {
  newApplicationsCount: number;
}) => (
  <>
    <Link
      href="/jobseeker/profile"
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      Миний профайл
    </Link>
    <Link
      href="/jobseeker/applications"
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 relative"
    >
      Миний өргөдлүүд
      {newApplicationsCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
          {newApplicationsCount}
        </span>
      )}
    </Link>
  </>
);

export const Header = () => {
  const { data: session, status } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [newApplicationsCount, setNewApplicationsCount] = useState(0);

  useEffect(() => {
    const fetchNewApplicationsCount = async () => {
      if (session?.user) {
        try {
          const endpoint =
            session.user.role === "EMPLOYER"
              ? "/api/employer/new-applications"
              : "/api/jobseeker/new-applications";

          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            setNewApplicationsCount(data.count);
          }
        } catch (error) {
          console.error("Error fetching new applications count:", error);
        }
      }
    };

    fetchNewApplicationsCount();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNewApplicationsCount, 30000);

    return () => clearInterval(interval);
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  // Close menu when clicking outside
  const closeMenu = () => {
    setShowProfileMenu(false);
  };

  const isEmployer = session?.user?.role === "EMPLOYER";

  return (
    <header className="flex flex-col justify-center px-32 py-3 w-full bg-white min-h-[70px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] max-md:px-5 max-md:max-w-full fixed top-0 z-50">
      <nav className="flex flex-wrap gap-8 justify-between items-center w-full max-w-[1420px] mx-auto max-md:max-w-full">
        <div className="flex flex-wrap gap-8 items-center min-w-60 text-[#0C213A] max-md:max-w-full">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-[#0C213A]"
          >
            Talento
          </Link>
          <div className="flex gap-8 items-center text-sm font-medium min-w-60">
            <Link
              href="/"
              className="hover:text-[#0C213A]/80 cursor-pointer relative group text-[#0C213A]"
            >
              <span className="group-hover:text-[#0C213A]/80 transition-colors">
                Нүүр
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0C213A] transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Link
              href="/jobs"
              className="hover:text-[#0C213A]/80 cursor-pointer relative group text-[#0C213A]"
            >
              <span className="group-hover:text-[#0C213A]/80 transition-colors">
                Ажлын байр
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0C213A] transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Link
              href="/about"
              className="hover:text-[#0C213A]/80 cursor-pointer relative group text-[#0C213A]"
            >
              <span className="group-hover:text-[#0C213A]/80 transition-colors">
                Таленто гэж юу вэ?
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0C213A] transition-all duration-300 group-hover:w-full"></div>
            </Link>
          </div>
        </div>
        <Link
          href="/aij"
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Image
            src="/icons/AI.png"
            alt="logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
        </Link>
        <div className="flex gap-4 text-sm">
          {!isEmployer && (
            <Link
              href="/employer/register"
              className="gap-2.5 self-stretch px-4 py-2 my-auto font-medium rounded-lg border border-solid border-[#0C213A]/40 text-[#0C213A]/60 hover:border-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5 transition-all duration-200"
            >
              Ажил олгогч
            </Link>
          )}

          {status === "authenticated" && session ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#0C213A]/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#0C213A] text-white flex items-center justify-center">
                  {session.user?.name?.[0]?.toUpperCase() ||
                    session.user?.email?.[0]?.toUpperCase() ||
                    "U"}
                </div>
                {isEmployer && (
                  <span className="text-xs px-2 py-1 bg-[#0C213A]/10 text-[#0C213A] rounded-full">
                    Ажил олгогч
                  </span>
                )}
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeMenu} />
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-[#0C213A]/60 border-b border-gray-200">
                        {session.user?.email}
                      </div>
                      {isEmployer ? (
                        <EmployerMenu
                          newApplicationsCount={newApplicationsCount}
                        />
                      ) : (
                        <UserMenu newApplicationsCount={newApplicationsCount} />
                      )}
                      <div className="border-t border-gray-200">
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-[#0C213A] hover:bg-[#0C213A]/5"
                          onClick={closeMenu}
                        >
                          Тохиргоо
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Гарах
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-[#0C213A]/20 animate-pulse" />
          ) : (
            <Link
              href="/jobseeker/login"
              className="gap-2.5 self-stretch px-4 py-2 my-auto font-bold text-white whitespace-nowrap rounded-lg bg-[#0C213A] hover:bg-[#0C213A]/90 transition-colors"
            >
              Нэвтрэх
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};
