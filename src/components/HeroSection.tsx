"use client";

import type { StatCard } from "./types";
import Spline from "@splinetool/react-spline";
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

const StatCard = ({ icon, value, label }: StatCard) => (
  <article className="flex gap-[20px] items-center bg-white rounded-[10px] w-[280px] h-[90px] px-4 py-[12px] shadow-[4px_4px_8px_rgba(189,195,199,0.75)]">
    <div className="flex items-center justify-center p-3 rounded bg-[#0C213A]">
      <img src={icon} className="w-8 h-8 object-contain" alt="" />
    </div>
    <div className="flex flex-col gap-[4px]">
      <p className="text-lg font-medium leading-6 text-[#18191C] font-['Inter']">
        {value}
      </p>
      <p className="text-xs font-normal leading-4 text-[#767F8C] font-['Inter']">
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
            notifTimeoutRef.current = setTimeout(() => setShowHeroNotif(false), 5000);
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
  const isEmployer = status === "authenticated" && session?.user?.role === "EMPLOYER";

  return (
    <section className="w-full min-h-[80vh] self-center px-32 w-full max-md:pt-8 max-md:max-w-full relative">
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
      {/* Spline background */}
      <div className="absolute inset-0 z-0">
        <Spline scene="https://prod.spline.design/hNC5B1RNfKCeT0ny/scene.splinecode" />
      </div>

      {/* Content container */}
      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[80vh] gap-16">
          {/* Left side - Text content */}
          <div className="flex flex-col max-w-full w-[55%] relative z-10">
            <div className="w-full font-semibold text-[#0C213A] max-md:max-w-full">
              <h2 className="text-5xl leading-[60px] max-md:max-w-full max-md:text-4xl max-md:leading-[52px]">
                Ажлын байрууд нээлттэй Мөрөөдлийн ажлаа сонгоорой!
              </h2>
              <p className="text-base leading-6 max-md:max-w-full pt-4">
                Амжилттай карьерын эхлэлийг тавих шилдэг ажлыг хайж байна уу?
              </p>
              <p>Энд олон боломж бий !!!</p>
            </div>
            <div className="flex flex-wrap gap-4 items-center self-start mt-8 max-md:mt-6 max-md:max-w-full">
              <input
                type="text"
                placeholder="Мэргэжил хайх..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="gap-2.5 self-stretch py-4 pr-24 pl-5 my-auto text-sm font-medium leading-none rounded-xl border border-solid border-[#0C213A] text-[#0C213A]/60 max-md:pr-5 bg-white/80 backdrop-blur-sm relative z-10"
              />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="flex gap-10 items-center self-stretch px-6 py-4 my-auto text-sm font-medium leading-none rounded-xl border border-solid border-[#0C213A] min-h-[52px] min-w-60 text-[#0C213A] w-[250px] max-md:px-5 bg-white/80 backdrop-blur-sm relative z-10"
              >
                <option value="">Бүх хот</option>
                {MONGOLIA_PROVINCES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSearch}
                className="flex overflow-hidden gap-2.5 items-center self-stretch p-4 my-auto rounded-xl bg-[#0C213A] h-[52px] w-[52px] hover:bg-[#0C213A]/90 transition-colors relative z-10"
              >
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/492220f772f4a785c9d6dff4e5ce3c39ba4e500e?placeholderIfAbsent=true"
                  className="object-contain self-stretch my-auto w-5 aspect-square"
                  alt="Search"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Доорх статистикууд */}
      <div className="flex flex-row gap-10 items-center max-md:max-w-full relative z-10">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </section>
  );
};
