"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPinIcon,
  ComputerDesktopIcon,
  UserCircleIcon,
  ServerStackIcon,
} from "@heroicons/react/24/outline";

const inputBaseClass =
  "w-full text-sm text-slate-700 border border-slate-300 placeholder-slate-400  rounded-md focus:outline-none  focus:ring-gray-500 focus:border-gray-500";
const inputPadding = "px-4 py-2.5";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [job, setJob] = useState<any>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/employer/jobs/${jobId}`);
        if (!res.ok) throw new Error("Ажлын байр ачаалахад алдаа гарлаа");
        const data = await res.json();
        setJob(data);
      } catch (e: any) {
        setError(e.message || "Алдаа гарлаа");
      } finally {
        setIsLoading(false);
      }
    };
    if (jobId) fetchJob();
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    const formData = new FormData(e.currentTarget);
    const requirements = formData.get("requirements") as string;
    const data = {
      title: formData.get("title") as string,
      description: requirements,
      location: formData.get("location") as string,
      requirements: requirements,
      salary: formData.get("salary") as string,
      workHours: formData.get("workHours") as string,
      type: formData.get("type") as string,
      companyUrl: formData.get("companyUrl") as string,
      contactPhone: formData.get("contactPhone") as string,
      otherInfo: formData.get("otherInfo") as string,
    };

    if (
      !data.title ||
      !data.description ||
      !data.location ||
      !data.requirements
    ) {
      setError("Бүх шаардлагатай талбаруудыг бөглөнө үү");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/employer/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Ажлын байр шинэчлэхэд алдаа гарлаа."
        );
      }
      setSuccessMessage("Ажлын байр амжилттай шинэчлэгдлээ!");
      setTimeout(() => router.push("/employer/profile"), 1200);
    } catch (error: any) {
      setError(error.message || "Тодорхойгүй алдаа гарлаа.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !job) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Ачаалж байна...
      </div>
    );
  }

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
        {job && (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
              <div className="lg:col-span-3 flex gap-6">
                <div className="w-[201px] h-[201px] border border-slate-300 rounded-lg flex flex-col items-center justify-center p-4 flex-shrink-0 bg-slate-50">
                  {/* Logo placeholder */}
                </div>
                <div className="flex-grow grid grid-cols-1 gap-y-4 content-start">
                  <div>
                    <input
                      type="text"
                      name="title"
                      required
                      defaultValue={job.title}
                      className={`${inputBaseClass} ${inputPadding}`}
                      placeholder="Албан тушаал..."
                    />
                  </div>
                  <div>
                    <input
                      type="url"
                      name="companyUrl"
                      defaultValue={job.companyUrl}
                      className={`${inputBaseClass} ${inputPadding}`}
                      placeholder="Байгууллагын линк URL"
                    />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="tel"
                      name="contactPhone"
                      defaultValue={job.contactPhone}
                      className={`${inputBaseClass} ${inputPadding}`}
                      placeholder="Утас"
                    />
                  </div>
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPinIcon className="h-4 w-4 text-slate-400" />
                      </div>
                      <select
                        name="location"
                        id="location"
                        required
                        defaultValue={job.location}
                        className={`${inputBaseClass} ${inputPadding} pl-10 appearance-none`}
                      >
                        <option value="">Байршил сонгоно уу</option>
                        <option value="Улаанбаатар">Улаанбаатар</option>
                        <option value="Алсын зайнаас">Алсын зайнаас</option>
                        <option value="Архангай аймаг">Архангай аймаг</option>
                        <option value="Баян-Өлгий аймаг">
                          Баян-Өлгий аймаг
                        </option>
                        <option value="Баянхонгор аймаг">
                          Баянхонгор аймаг
                        </option>
                        <option value="Булган аймаг">Булган аймаг</option>
                        <option value="Говь-Алтай аймаг">
                          Говь-Алтай аймаг
                        </option>
                        <option value="Говьсүмбэр аймаг">
                          Говьсүмбэр аймаг
                        </option>
                        <option value="Дархан-Уул аймаг">
                          Дархан-Уул аймаг
                        </option>
                        <option value="Дорноговь аймаг">Дорноговь аймаг</option>
                        <option value="Дорнод аймаг">Дорнод аймаг</option>
                        <option value="Дундговь аймаг">Дундговь аймаг</option>
                        <option value="Завхан аймаг">Завхан аймаг</option>
                        <option value="Орхон аймаг">Орхон аймаг</option>
                        <option value="Өвөрхангай аймаг">
                          Өвөрхангай аймаг
                        </option>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="salary"
                      defaultValue={job.salary}
                      className={`${inputBaseClass} ${inputPadding}`}
                      placeholder="Үнэлгээ"
                    />
                  </div>
                  <select
                    name="type"
                    defaultValue={job.type}
                    className={`${inputBaseClass} ${inputPadding}`}
                  >
                    <option value="">Ажлын цаг</option>
                    <option value="FULL_TIME">Бүтэн цагийн</option>
                    <option value="PART_TIME">Цагийн</option>
                    <option value="CONTRACT">Гэрээт</option>
                    <option value="INTERNSHIP">Дадлага</option>
                  </select>
                </div>
                <div>
                  <textarea
                    name="requirements"
                    required
                    defaultValue={job.requirements}
                    className={`${inputBaseClass} ${inputPadding} min-h-[120px]`}
                    placeholder="Тавигдах шаардлага, ажлын байрны дэлгэрэнгүй..."
                  />
                </div>
                <div>
                  <textarea
                    name="otherInfo"
                    defaultValue={job.otherInfo}
                    className={`${inputBaseClass} ${inputPadding} min-h-[80px]`}
                    placeholder="Бусад мэдээлэл (заавал биш)"
                  />
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Хадгалж байна..." : "Хадгалах"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-8 py-3 rounded-lg shadow transition"
                  >
                    Буцах
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
