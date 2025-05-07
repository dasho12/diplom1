"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PostJob() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      location: formData.get("location") as string,
      salary: formData.get("salary") as string,
      requirements: formData.get("requirements") as string,
      type: formData.get("type") as string,
    };

    try {
      const response = await fetch("/api/employer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }

      router.push("/employer/profile?message=Job posted successfully!");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="pb-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-black">
              Шинэ ажлын байр нийтлэх
            </h1>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-black"
              >
                Ажлын байрны нэр
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-black"
              >
                Дэлгэрэнгүй мэдээлэл
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>

            <div>
              <label
                htmlFor="requirements"
                className="block text-sm font-medium text-black"
              >
                Тавигдах шаардлага
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={4}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-black"
                >
                  Байршил
                </label>
                <select
                  name="location"
                  id="location"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Байршил сонгоно уу</option>
                  <option value="Улаанбаатар">Улаанбаатар</option>
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
                  <option value="Дархан">Дархан</option>
                  <option value="Эрдэнэт">Эрдэнэт</option>
                  <option value="Чойбалсан">Чойбалсан</option>
                  <option value="Мөрөн">Мөрөн</option>
                  <option value="Ховд">Ховд</option>
                  <option value="Улаангом">Улаангом</option>
                  <option value="Баянхонгор">Баянхонгор</option>
                  <option value="Арвайхээр">Арвайхээр</option>
                  <option value="Сүхбаатар">Сүхбаатар</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="salary"
                  className="block text-sm font-medium text-black"
                >
                  Цалин
                </label>
                <input
                  type="text"
                  name="salary"
                  id="salary"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                  placeholder="Жишээ: 1.5-2.5 сая ₮"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-black"
              >
                Ажлын төрөл
              </label>
              <select
                id="type"
                name="type"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              >
                <option value="FULL_TIME">Бүтэн цагийн</option>
                <option value="PART_TIME">Цагийн</option>
                <option value="CONTRACT">Гэрээт</option>
                <option value="INTERNSHIP">Дадлага</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/employer/profile"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Буцах
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? "Нийтэлж байна..." : "Нийтлэх"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
