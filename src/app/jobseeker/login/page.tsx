"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
// Frontend-д @prisma/client импортлох шаардлагагүй
// import { UserRole } from '@prisma/client';

export default function JobSeekerLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Алдааг арилгах
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        expectedRole: "USER",
        redirect: false, // Backend role шалгалтад найдна
      });

      // Backend-ийн authorize функц role буруу эсвэл нууц үг буруу үед error буцаана
      if (result?.error) {
        setError(
          result.error || "Имэйл, нууц үг буруу эсвэл танд нэвтрэх эрх байхгүй байна."
        );
      } else if (result?.ok) { // Амжилттай болсон (backend role-г зөвшөөрсөн)
        router.push("/"); // Employer dashboard руу чиглүүлэх
      } else {
         // Бусад тохиолдол (ховор байх)
         setError("Нэвтрэхэд тодорхойгүй алдаа гарлаа.");
      }
    } catch (error: any) {
       console.error("Login error:", error);
       setError(error.message || "Нэвтрэх үед системийн алдаа гарлаа."); // Catch block-ийн алдаа
    }
  };

  // ... үлдсэн JSX код нь Ажил олгогчийн хувилбартай байх ёстой ...
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              {/* Replace with actual logo if available */}
              <span className="text-2xl font-bold text-gray-900">Лого</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                Тусламж
              </button>
              <button
                onClick={() => router.push("/jobseeker/register")} // Link to jobseeker registration
                className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Бүртгүүлэх (Ажил хайгч)
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Ажил хайгч нэвтрэх
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Та өөрийн бүртгэлтэй имэйл хаяг, нууц үгээ оруулна уу
          </p>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div
                  className="text-red-600 text-sm text-center bg-red-100 border border-red-300 p-3 rounded-lg"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Имэйл хаяг
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="jobseeker@email.com" // Updated placeholder
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Нууц үг
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Намайг сана
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#" // Update if you have a password reset page for job seekers
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Нууц үгээ мартсан?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Нэвтрэх
                </button>
              </div>
            </form>

             {/* Social logins and separator removed */}
             {/* <div className="mt-6">
               <div className="relative">
                 <div className="absolute inset-0 flex items-center">
                   <div className="w-full border-t border-gray-300"></div>
                 </div>
                 <div className="relative flex justify-center text-sm">
                   <span className="px-2 bg-white text-gray-500">Эсвэл</span>
                 </div>
               </div>

               <div className="mt-6 grid grid-cols-2 gap-3">
                 <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                   Google
                 </button>
                 <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                   Facebook
                 </button>
               </div>
             </div> */}
          </div>

           {/* Link to job seeker registration */}
           <p className="mt-4 text-center text-sm text-gray-600">
              Бүртгэлгүй юу?{" "}
              <a
               href="/jobseeker/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
               Бүртгүүлэх
              </a>
            </p>
        </div>
      </div>
    </div>
  );

} 