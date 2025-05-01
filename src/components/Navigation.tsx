"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export const Header = () => {
  const { data: session, status } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  // Close menu when clicking outside
  const closeMenu = () => {
    setShowProfileMenu(false);
  };

  return (
    <header className="flex flex-col justify-center px-32 py-3 w-full bg-white min-h-[70px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] max-md:px-5 max-md:max-w-full fixed top-0 z-50">
      <nav className="flex flex-wrap gap-8 justify-between items-center w-full max-w-[1420px] mx-auto max-md:max-w-full">
        <div className="flex flex-wrap gap-8 items-center min-w-60 text-slate-900 max-md:max-w-full">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Talento
          </Link>
          <div className="flex gap-8 items-center text-sm font-medium min-w-60">
            <Link
              href="/"
              className="hover:text-slate-700 cursor-pointer relative group text-slate-900"
            >
              <span className="group-hover:text-slate-700 transition-colors">
                Нүүр
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Link
              href="/jobs"
              className="hover:text-slate-700 cursor-pointer relative group text-slate-900"
            >
              <span className="group-hover:text-slate-700 transition-colors">
                Ажлын байр
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Link
              href="#about"
              className="hover:text-slate-700 cursor-pointer relative group text-slate-900"
            >
              <span className="group-hover:text-slate-700 transition-colors">
                Таленто гэж юу вэ?
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 group-hover:w-full"></div>
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
        <div className="flex gap-4 items-center text-sm min-w-60">
          <Link
            href="/employer"
            className="gap-2.5 self-stretch px-4 py-2 my-auto font-medium rounded-lg border border-solid border-slate-900 text-slate-900 hover:bg-slate-50 transition-colors"
          >
            Ажил олгогч
          </Link>

          {status === "authenticated" && session ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                  {session.user?.name?.[0]?.toUpperCase() ||
                    session.user?.email?.[0]?.toUpperCase() ||
                    "U"}
                </div>
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeMenu} />
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200">
                        {session.user?.email}
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={closeMenu}
                      >
                        Профайл
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={closeMenu}
                      >
                        Тохиргоо
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                      >
                        Гарах
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : (
            <Link
              href="/login"
              className="gap-2.5 self-stretch px-4 py-2 my-auto font-bold text-white whitespace-nowrap rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              Нэвтрэх
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};
