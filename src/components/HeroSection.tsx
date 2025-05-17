"use client";

import type { StatCard } from "./types";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const MONGOLIA_PROVINCES = [
  "Архангай",
  "Баян-Өлгий",
  "Баянхонгор",
  "Булган",
  "Говь-Алтай",
  "Говьсүмбэр",
  "Дархан-Уул",
  "Дорноговь",
  "Дорнод",
  "Дундговь",
  "Завхан",
  "Өвөрхангай",
  "Өмнөговь",
  "Сүхбаатар",
  "Сэлэнгэ",
  "Төв",
  "Увс",
  "Ховд",
  "Хөвсгөл",
  "Хэнтий",
  "Улаанбаатар",
];

const stats: StatCard[] = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/07d690b7a11fb6e9a72dafc120bf10db5aed2658?placeholderIfAbsent=true",
    value: "1,234",
    label: "Ажлын байр",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/881d9c0c8ae8302d4f91f76ca0f7f67975fbeb6e?placeholderIfAbsent=true",
    value: "567",
    label: "Байгууллага",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/6e1ae373b63cb8985cbb0338d0521a27bd9d3d7b?placeholderIfAbsent=true",
    value: "8,901",
    label: "Ажил хайж буй хүмүүс",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/0530adb336adca5f8501fed8e0b22af603d45a6d?placeholderIfAbsent=true",
    value: "234",
    label: "Шинэ ажлын байр",
  },
];

const StatCard = ({ icon, value, label, className }: StatCard & { className?: string }) => (
  <article className={`flex gap-[20px] items-center bg-white rounded-[10px] w-[320px] h-[90px] px-6 py-4 shadow-[4px_4px_8px_rgba(189,195,199,0.75)] ${className}`}>
    <div className="flex items-center justify-center p-3 rounded bg-[#0C213A]">
      <img src={icon} className="w-8 h-8 object-contain" alt="" />
    </div>
    <div className="flex flex-col gap-[10px]">
      <p className="text-xl font-semibold leading-6 text-[#0C213A] font-poppins">
        {value}
      </p>
      <p className="text-sm font-medium leading-4 text-[#0C213A]/60 font-poppins">
        {label}
      </p>
    </div>
  </article>
);

export const HeroSection = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showHeroNotif, setShowHeroNotif] = useState(false);
  const [lastCount, setLastCount] = useState(0);
  const notifTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchNewApplications = async () => {
      try {
        const response = await fetch("/api/employer/applications");
        if (response.ok) {
          const data = await response.json();
          // Only count PENDING and unviewed applications
          const newPending = data.filter(
            (app: any) => app.status === "PENDING" && !app.viewedAt
          );
          if (newPending.length > 0 && newPending.length > lastCount) {
            setShowHeroNotif(true);
            if (notifTimeoutRef.current) clearTimeout(notifTimeoutRef.current);
            notifTimeoutRef.current = setTimeout(
              () => setShowHeroNotif(false),
              5000
            );
          }
          setLastCount(newPending.length);
        }
      } catch {}
    };
    fetchNewApplications();
    const interval = setInterval(fetchNewApplications, 5000);
    return () => {
      clearInterval(interval);
      if (notifTimeoutRef.current) clearTimeout(notifTimeoutRef.current);
    };
  }, [lastCount]);

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (searchTerm) {
      queryParams.set("search", searchTerm);
    }
    if (selectedCity) {
      queryParams.set("city", selectedCity);
    }
    router.push(`/jobs?${queryParams.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Show notification зөвхөн employer нэвтэрсэн үед
  const isEmployer =
    status === "authenticated" && session?.user?.role === "EMPLOYER";

  return (
    <section className="px-32">
      {isEmployer && showHeroNotif && (
        <div className="fixed top-8 right-8 z-50 flex justify-end items-start">
          <div className="bg-blue-500 text-white px-5 py-3 rounded-xl shadow-lg font-semibold text-base flex items-center gap-3 animate-fade-in-out relative min-w-[200px]">
            <span>Шинэ анкет ирлээ!</span>
            <button
              onClick={() => setShowHeroNotif(false)}
              className="ml-2 text-white/80 hover:text-white text-lg font-bold absolute top-2 right-2"
              aria-label="Хаах"
            >
              ×
            </button>
          </div>
        </div>
      )}
      

      {/* Content container */}
      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[80vh]">
          {/* Left side - Text content */}
          <div className="flex flex-col max-w-full w-[45%] relative z-10 pt-30">
            <div className="w-full font-semibold text-[#0C213A] max-md:max-w-full">
              <h2 className="text-7xl leading-[60px] max-md:max-w-full max-md:text-4xl max-md:leading-[52px] font-poppins font-bold">
                <span className="block mb-6">Your Dream Job</span>
                <span className="block mb-6">is Waiting Browse</span>
                <span className="block">Our Open Roles!</span>
              </h2>
              <p className="text-base leading-6 max-md:max-w-full pt-6 font-poppins font-medium">
                Амжилттай карьерын эхлэлийг тавих шилдэг ажлыг хайж байна уу?
              </p>
              <p className="font-poppins font-medium">Энд олон боломж бий !!!</p>
            </div>
            <div className="flex gap-2 mb-6 pt-15 max-md:mt-6 max-md:max-w-full">
              <input
                type="text"
                placeholder="Мэргэжил хайх..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-[2] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 hover:border-slate-900 focus:border-slate-900 font-medium text-gray-900 text-sm"
              />
              <div className="relative w-60">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-slate-400 hover:border-slate-900 focus:border-slate-900 font-medium text-gray-500 text-sm appearance-none"
                >
                  <option value="">Бүх хот</option>
                  {MONGOLIA_PROVINCES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown icon */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <img src="/icons/sum.svg" alt="Dropdown" className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* Right side - Hero icon */}
          <div className="flex items-center justify-end w-[45%] relative z-10 pt-30 p-0 m-0">
            <img src="/icons/hero.svg" alt="Hero" className="w-[600px] h-[560px] object-cover p-0 m-0" />
          </div>
        </div>
      </div>

      {/* Доорх статистикууд */}
      <div className="flex flex-row gap-10 items-center max-md:max-w-full relative z-10 justify-between pt-10">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} className="font-poppins" />
        ))}
      </div>
    </section>
  );
};
