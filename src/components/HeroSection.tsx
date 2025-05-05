'use client';

import type { StatCard } from "./types";
import Spline from "@splinetool/react-spline";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  "Улаанбаатар"
];

const stats: StatCard[] = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/07d690b7a11fb6e9a72dafc120bf10db5aed2658?placeholderIfAbsent=true",
    value: "175,324",
    label: "Ажлын байр",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/881d9c0c8ae8302d4f91f76ca0f7f67975fbeb6e?placeholderIfAbsent=true",
    value: "97,354",
    label: "Байгууллага",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/6e1ae373b63cb8985cbb0338d0521a27bd9d3d7b?placeholderIfAbsent=true",
    value: "38,47,154",
    label: "Ажил хайж буй хүмүүс",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/0530adb336adca5f8501fed8e0b22af603d45a6d?placeholderIfAbsent=true",
    value: "7,532",
    label: "Шинэ ажлын байр",
  },
];

const StatCard = ({ icon, value, label }: StatCard) => (
  <article className="flex gap-8 items-center self-stretch  my-auto bg-white rounded-xl min-h-[103px] min-w-60 shadow-[-8px_-8px_4px_rgba(255,255,255,0.25)] w-[333px]">
    <div className="flex gap-2.5 items-center self-stretch p-4 my-auto rounded bg-slate-900 h-[72px] w-[72px]">
      <img
        src={icon}
        className="object-contain self-stretch my-auto w-10 aspect-square"
        alt=""
      />
    </div>
    <div className="self-stretch my-auto w-[180px]">
      <p className="text-2xl font-medium leading-none text-zinc-900">{value}</p>
      <p className="mt-1.5 text-base text-gray-500">{label}</p>
    </div>
  </article>
);

export const HeroSection = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (searchTerm) {
      queryParams.set('search', searchTerm);
    }
    if (selectedCity) {
      queryParams.set('city', selectedCity);
    }
    router.push(`/jobs?${queryParams.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="w-full min-h-screen self-center px-32  w-full max-md:pt-10 max-md:max-w-full relative">
      {/* Spline background */}
      <div className="container mx-auto ">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen gap-20">
          {/* Left side - Text content */}
          <div className="flex flex-col max-w-full w-[55%]">
            <div className="w-full  font-semibold  text-slate-900 max-md:max-w-full">
              <h2 className="text-5xl leading-[60px] max-md:max-w-full max-md:text-4xl max-md:leading-[52px]">
                Ажлын байрууд нээлттэй Мөрөөдлийн ажлаа сонгоорой!
              </h2>
              <p className=" text-base leading-6 max-md:max-w-full">
                Амжилттай карьерын эхлэлийг тавих шилдэг ажлыг хайж байна уу?
              </p>
              <p>Энд олон боломж бий !!!</p>
            </div>
            <div className="flex flex-wrap gap-4 items-center self-start mt-12 max-md:mt-8 max-md:max-w-full">
              <input
                type="text"
                placeholder="Мэргэжил хайх..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="gap-2.5 self-stretch py-5 pr-24 pl-5 my-auto text-sm font-medium leading-none rounded-xl border border-solid border-slate-900 text-slate-600 max-md:pr-5"
              />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="flex gap-10 items-center self-stretch px-6 py-5 my-auto text-sm font-medium leading-none rounded-xl border border-solid border-slate-900 min-h-[60px] min-w-60 text-slate-900 w-[250px] max-md:px-5"
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
                className="flex overflow-hidden gap-2.5 items-center self-stretch p-5 my-auto rounded-xl bg-slate-900 h-[60px] w-[60px]"
              >
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/492220f772f4a785c9d6dff4e5ce3c39ba4e500e?placeholderIfAbsent=true"
                  className="object-contain self-stretch my-auto w-5 aspect-square"
                  alt="Search"
                />
              </button>
            </div>
          </div>

          {/* Right side - Spline animation */}
          <div className="w-full lg:w-1/2 h-[500px] lg:h-[600px] relative">
            <div className="absolute inset-0">
              <Spline scene="https://prod.spline.design/hNC5B1RNfKCeT0ny/scene.splinecode" />
            </div>
          </div>
        </div>
      </div>

      {/* Доорх статистикууд */}
      <div className="flex flex-row gap-6 items-center  max-md:mt-10 max-md:max-w-full">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </section>
  );
};
