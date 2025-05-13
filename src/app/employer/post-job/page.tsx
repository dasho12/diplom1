"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  LinkIcon as UrlIcon, // Renamed for clarity
  PhoneIcon,
  ClockIcon, 
  BuildingOfficeIcon, 
  PhotoIcon, 
  PlusCircleIcon,
  PaperAirplaneIcon,
  ArrowUturnLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TagIcon, 
  ListBulletIcon,
  PlusIcon,
  ServerStackIcon, // Placeholder for Talento Logo in Nav
  UserCircleIcon, // Placeholder for User Icon in Nav
  ComputerDesktopIcon, // Placeholder for AI icon
} from '@heroicons/react/24/outline';

// Helper component for Skill Tags
const SkillTag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block text-slate-700 text-sm font-medium px-4 py-1.5 border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer">
    {children}
  </span>
);

// Placeholder for actual icons in the Nav
const AiIconPlaceholder = () => <ComputerDesktopIcon className="w-6 h-6 text-slate-700" />;
const UserIconPlaceholder = () => <UserCircleIcon className="w-7 h-7 text-slate-700" />;
const TalentoLogoNav = () => <ServerStackIcon className="w-7 h-7 text-slate-700" />;

export default function PostJobPageWithNewDesign() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      companyUrl: formData.get("companyUrl") as string,
      contactPhone: formData.get("contactPhone") as string,
      location: formData.get("location") as string,
      salary: formData.get("salary") as string,      // "Үнэлгээ"
      workHours: formData.get("workHours") as string,
      type: formData.get("jobTypeSelect") as string, 
      requirements: formData.get("requirements") as string, // "Үндсэн тавигдах шаардлага"
      otherInfo: formData.get("otherInfo") as string,    // "Бусад"
    };

    try {
      const response = await fetch("/api/employer/jobs", { // Ensure this API endpoint is correct
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ажлын байр нийтлэхэд алдаа гарлаа.");
      }
      setSuccessMessage("Ажлын байр амжилттай нийтлэгдлээ!");
      e.currentTarget.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Тодорхойгүй алдаа гарлаа.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClass = "w-full text-sm text-slate-700 border border-slate-300 placeholder-slate-400  rounded-md focus:outline-none  focus:ring-gray-500 focus:border-gray-500";
  const inputPadding = "px-4 py-2.5"; 
  const labelBaseClass = "text-sm font-poppins text-slate-700";

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <main className="max-w-[1420px] mx-auto px-21 py-10 sm:py-12 mt-15">
        {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-3 rounded-md shadow">
                <p className="text-sm text-red-700">{error}</p>
            </div>
        )}
        {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-3 rounded-md shadow">
                <p className="text-sm text-green-700">{successMessage}</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Section: Core Info + Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Logo and Small Fields Area (Spans 5 columns) */}
            <div className="lg:col-span-4 flex gap-6">
                {/* Logo Area */} 
                <div className="w-[201px] h-[201px] border border-slate-300 rounded-lg flex flex-col items-center justify-center p-4 flex-shrink-0">
                    <PhotoIcon className="w-12 h-12 text-slate-400 mb-2" />
                    <p className={`text-xs ${labelBaseClass} font-light text-center`}>Лого</p>
                </div>
                {/* Input Fields Next to Logo */} 
                <div className="flex-grow grid grid-cols-2 gap-x-5 gap-y-4 content-start">
                    <div className="col-span-2">
                        <input type="text" name="title" required className={`${"w-[450px] text-sm text-slate-700 border border-slate-300 placeholder-slate-400  rounded-md focus:outline-none  focus:ring-gray-500 focus:border-gray-500"} ${inputPadding}`} placeholder="Албан тушаал..."/>
                    </div>
                    <div className="col-span-2">
                        <input type="url" name="companyUrl" className={`${"w-[450px] text-sm text-slate-700 border border-slate-300 placeholder-slate-400  rounded-md focus:outline-none  focus:ring-gray-500 focus:border-gray-500"} ${inputPadding}`} placeholder="Байгууллагын линк URL"/>
                    </div>
                    <div>
                        <input type="tel" name="contactPhone" className={`${"w-[200px] text-sm text-slate-700 border border-slate-300 placeholder-slate-400  rounded-md focus:outline-none  focus:ring-gray-500 focus:border-gray-500"} ${inputPadding}`} placeholder="Утас"/>
                    </div>
                     <div>
                        <div className="relative"> {/* Adjusted margin top if needed */}
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPinIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <select 
                                name="location" 
                                id="location" 
                                required 
                                className={`${"w-[200px] text-sm text-slate-700 border border-slate-300 placeholder-slate-400  rounded-md focus:outline-none  focus:ring-gray-500 focus:border-gray-500"} ${inputPadding} pl-10 appearance-none`} // Added appearance-none to better style select arrow if needed
                            >
                              <option value="">Байршил сонгоно уу</option>
                              <option value="Улаанбаатар">Улаанбаатар</option>
                              <option value="Алсын зайнаас">Алсын зайнаас</option>
                              <option value="Архангай аймаг">Архангай аймаг</option>
                              <option value="Баян-Өлгий аймаг">Баян-Өлгий аймаг</option>
                              <option value="Баянхонгор аймаг">Баянхонгор аймаг</option>
                              <option value="Булган аймаг">Булган аймаг</option>
                              <option value="Говь-Алтай аймаг">Говь-Алтай аймаг</option>
                              <option value="Говьсүмбэр аймаг">Говьсүмбэр аймаг</option>
                              <option value="Дархан-Уул аймаг">Дархан-Уул аймаг</option>
                              <option value="Дорноговь аймаг">Дорноговь аймаг</option>
                              <option value="Дорнод аймаг">Дорнод аймаг</option>
                              <option value="Дундговь аймаг">Дундговь аймаг</option>
                              <option value="Завхан аймаг">Завхан аймаг</option>
                              <option value="Орхон аймаг">Орхон аймаг</option>
                              <option value="Өвөрхангай аймаг">Өвөрхангай аймаг</option>
                              <option value="Өмнөговь аймаг">Өмнөговь аймаг</option>
                              <option value="Сүхбаатар аймаг">Сүхбаатар аймаг</option>
                              <option value="Сэлэнгэ аймаг">Сэлэнгэ аймаг</option>
                              <option value="Төв аймаг">Төв аймаг</option>
                              <option value="Увс аймаг">Увс аймаг</option>
                              <option value="Ховд аймаг">Ховд аймаг</option>
                              <option value="Хөвсгөл аймаг">Хөвсгөл аймаг</option>
                              <option value="Хэнтий аймаг">Хэнтий аймаг</option>
                              <option value="Дархан">Дархан (хот)</option>
                              <option value="Эрдэнэт">Эрдэнэт (хот)</option>
                              <option value="Чойбалсан">Чойбалсан (хот)</option>
                              <option value="Мөрөн">Мөрөн (хот)</option>
                              <option value="Ховд">Ховд (хот)</option>
                              <option value="Улаангом">Улаангом (хот)</option>
                              <option value="Баянхонгор">Баянхонгор (хот)</option>
                              <option value="Арвайхээр">Арвайхээр (хот)</option>
                              <option value="Сүхбаатар">Сүхбаатар (хот)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <input type="text" name="salary" className={`${"w-[200px] text-sm text-slate-700 border border-slate-300 placeholder-slate-400  rounded-md focus:outline-none  focus:ring-gray-500 focus:border-gray-500"} ${inputPadding}`} placeholder="Үнэлгээ"/>
                    </div>
                    <div>
                        <input type="text" name="workHours" className={`${"w-[200px] text-sm text-slate-700 border border-slate-300 placeholder-slate-400  rounded-md focus:outline-none  focus:ring-gray-500 focus:border-gray-500"} ${inputPadding}`} placeholder="Ажлын цаг"/>
                    </div>
                </div>
            </div>

            {/* Skills Area (Spans 3 columns) */}
            
          </div>

          {/* Middle Section: Requirements Card */}
          <div className=" rounded-lg mt-2">
            {/* <label htmlFor="requirements" className={`${labelBaseClass} font-medium mb-2 block`}>Үндсэн тавигдах шаардлага <span className="text-red-500">*</span></label> */}
            <textarea 
              id="requirements" 
              name="requirements" 
              rows={10} 
              required 
              className={`${inputBaseClass} ${inputPadding}`}
              placeholder="Үндсэн тавигдах шаардлага: Ажилтанд тавигдах гол шаардлагууд, туршлага, боловсрол, ур чадварууд, гэрчилгээ зэргийг дэлгэрэнгүй бичнэ үү..."
            />
          </div>

          {/* Bottom Section: Description / Other Card */}
          <div className=" rounded-lg">
            {/* <label htmlFor="otherInfo" className={`${labelBaseClass} font-medium mb-2 block`}>Бусад (Нэмэлт мэдээлэл)</label> */}
            <textarea 
              id="otherInfo" 
              name="otherInfo" 
              rows={10} 
              className={`${inputBaseClass} ${inputPadding}`}
              placeholder="Бусад (Нэмэлт мэдээлэл): Ажлын байрны онцлог, компанийн соёл, ажиллах орчин, нөхцөл, хангамж, боломжууд болон бусад нэмэлт мэдээллийг энд оруулна уу..."
            />
          </div>

           {/* Submit Buttons - You might want to place these more prominently or differently */}
            <div className="flex justify-end space-x-3">
                <Link
                    href="/employer/profile" 
                    className="px-5 py-2.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    Буцах
                </Link>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-70 transition-colors"
                >
                    {isLoading ? "Илгээж байна..." : "Нийтлэх"}
                </button>
            </div>
        </form>
      </main>
    </div>
  );
}
