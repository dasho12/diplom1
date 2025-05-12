"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    status: "ACTIVE",
    type: "FULL_TIME",
    requirements: "",
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/employer/jobs/${jobId}`);
        if (!res.ok) throw new Error("Ажлын байр олдсонгүй");
        const job = await res.json();
        setForm({
          title: job.title || "",
          description: job.description || "",
          location: job.location || "",
          salary: job.salary || "",
          status: job.status || "ACTIVE",
          type: job.type || "FULL_TIME",
          requirements: job.requirements || "",
        });
      } catch (e: any) {
        setError(e.message || "Алдаа гарлаа");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/employer/jobs/${jobId}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Шинэчлэхэд алдаа гарлаа");
      router.push("/employer/profile");
    } catch (e: any) {
      setError(e.message || "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-black">Ачаалж байна...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-black">Ажлын байр засах</h1>
            <Link
              href="/employer/profile"
              className="text-black hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Гарчиг
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Тайлбар
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Шаардлага
              </label>
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Байршил
              </label>
              <select
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              >
                <option value="">Байршил сонгоно уу</option>
                {/* <optgroup label="Улаанбаатар">
                  <option value="Улаанбаатар - Баянзүрх дүүрэг">Баянзүрх дүүрэг</option>
                  <option value="Улаанбаатар - Сүхбаатар дүүрэг">Сүхбаатар дүүрэг</option>
                  <option value="Улаанбаатар - Чингэлтэй дүүрэг">Чингэлтэй дүүрэг</option>
                  <option value="Улаанбаатар - Хан-Уул дүүрэг">Хан-Уул дүүрэг</option>
                  <option value="Улаанбаатар - Баянгол дүүрэг">Баянгол дүүрэг</option>
                  <option value="Улаанбаатар - Сонгинохайрхан дүүрэг">Сонгинохайрхан дүүрэг</option>
                  <option value="Улаанбаатар - Налайх дүүрэг">Налайх дүүрэг</option>
                  <option value="Улаанбаатар - Багануур дүүрэг">Багануур дүүрэг</option>
                  <option value="Улаанбаатар - Багахангай дүүрэг">Багахангай дүүрэг</option>
                </optgroup> */}
                <optgroup label="">
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
                  <option value="Улаанбаатар">Улаанбаатар</option>
                </optgroup>
                {/* <optgroup label="Том хотууд">
                  <option value="Дархан">Дархан</option>
                  <option value="Эрдэнэт">Эрдэнэт</option>
                  <option value="Чойбалсан">Чойбалсан</option>
                  <option value="Мөрөн">Мөрөн</option>
                  <option value="Ховд">Ховд</option>
                  <option value="Улаангом">Улаангом</option>
                  <option value="Баянхонгор">Баянхонгор</option>
                  <option value="Арвайхээр">Арвайхээр</option>
                  <option value="Улаанбаатар">Улаанбаатар</option>
                  <option value="Сүхбаатар">Сүхбаатар</option>
                </optgroup> */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Цалин
              </label>
              <input
                type="text"
                name="salary"
                value={form.salary}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Ажлын төрөл
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="FULL_TIME">Бүтэн цагийн</option>
                <option value="PART_TIME">Цагийн</option>
                <option value="CONTRACT">Гэрээт</option>
                <option value="INTERNSHIP">Дадлага</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/employer/profile"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Буцах
              </Link>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? "Хадгалж байна..." : "Хадгалах"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
