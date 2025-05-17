"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";

interface Company {
  id: string;
  name: string;
  description: string;
  location: string;
  website: string;
  logoUrl?: string;
  coverImageUrl?: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  type: string;
  status: string;
  createdAt: string;
}

export default function EmployerProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState<Company | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("jobs");
  const [applications, setApplications] = useState<any[]>([]);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutEdit, setAboutEdit] = useState({
    name: company?.name || "",
    location: company?.location || "",
    website: company?.website || "",
    description: company?.description || "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [newApplicationsCount, setNewApplicationsCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && !hasLoaded) {
      if (session?.user?.role === "EMPLOYER") {
        fetchCompanyAndJobs();
        setHasLoaded(true);
      } else {
        router.push("/login");
      }
    }
  }, [status, session, hasLoaded]);

  useEffect(() => {
    if (company) {
      setEditedCompany(company);
    }
  }, [company]);

  useEffect(() => {
    if (activeTab === "anketuud") {
      const fetchApplications = async () => {
        try {
          const res = await fetch("/api/employer/applications");
          const text = await res.text();
          if (!text) {
            setApplications([]);
          } else {
            const data = JSON.parse(text);
            setApplications(data);
          }
        } catch (e) {
          setApplications([]);
        }
      };
      fetchApplications();
    }
  }, [activeTab]);

  useEffect(() => {
    setAboutEdit({
      name: company?.name || "",
      location: company?.location || "",
      website: company?.website || "",
      description: company?.description || "",
    });
  }, [company]);

  useEffect(() => {
    // Fetch new applications count
    const fetchNewCount = async () => {
      try {
        const res = await fetch("/api/employer/applications/new-count");
        if (res.ok) {
          const text = await res.text();
          if (!text) {
            setNewApplicationsCount(0);
          } else {
            const data = JSON.parse(text);
            setNewApplicationsCount(data.count || 0);
          }
        }
      } catch (e) {
        setNewApplicationsCount(0);
      }
    };
    fetchNewCount();
  }, []);

  const fetchCompanyAndJobs = async () => {
    try {
      const companyRes = await fetch("/api/employer/company");
      const text = await companyRes.text();
      if (!text) {
        throw new Error("Хоосон хариу ирлээ");
      }
      const companyData = JSON.parse(text);
      setCompany(companyData);
      const jobsRes = await fetch("/api/employer/jobs");
      const textJobs = await jobsRes.text();
      if (!textJobs) {
        setJobs([]);
      } else {
        const jobsData = JSON.parse(textJobs);
        setJobs(jobsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      let logoUrl = company?.logoUrl;

      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploadRes = await fetch("/api/upload/company-logo", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload logo");
        }

        const text = await uploadRes.text();
        if (!text) {
          throw new Error("Хоосон хариу ирлээ");
        }
        const uploadData = JSON.parse(text);
        logoUrl = uploadData.url;
      }

      const response = await fetch("/api/employer/company/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedCompany?.name,
          location: editedCompany?.location,
          logoUrl: logoUrl,
          description: editedCompany?.description,
          website: editedCompany?.website,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update company profile");
      }

      const textUpdatedCompany = await response.text();
      if (!textUpdatedCompany) {
        throw new Error("Хоосон хариу ирлээ");
      }
      const updatedCompany = JSON.parse(textUpdatedCompany);
      setCompany(updatedCompany);
      setIsEditing(false);
      setLogoFile(null);
      setLogoPreview(null);

      // Show success message
      alert("Профайл амжилттай шинэчлэгдлээ");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Профайл шинэчлэхэд алдаа гарлаа. Дараа дахин оролдоно уу.");
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm("Энэ ажлын байрыг устгахдаа итгэлтэй байна уу?")) {
      try {
        const response = await fetch(`/api/employer/jobs/${jobId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setJobs(jobs.filter((job) => job.id !== jobId));
        } else {
          alert("Ажлын байрыг устгахад алдаа гарлаа");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Ажлын байрыг устгахад алдаа гарлаа");
      }
    }
  };

  // Helper functions for status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Хүлээгдэж буй";
      case "ACCEPTED":
        return "Зөвшөөрөгдсөн";
      case "REJECTED":
        return "Татгалзсан";
      default:
        return status;
    }
  };

  const handleStatusChange = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(
        `/api/employer/applications/${applicationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Статус шинэчлэхэд алдаа гарлаа");
      }
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAboutSave = async () => {
    try {
      const response = await fetch("/api/employer/company/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aboutEdit),
      });
      if (!response.ok) throw new Error("Failed to update company info");
      const textUpdated = await response.text();
      if (!textUpdated) {
        throw new Error("Хоосон хариу ирлээ");
      }
      const updated = JSON.parse(textUpdated);
      setCompany(updated);
      setIsEditingAbout(false);
    } catch (e) {
      alert("Шинэчлэхэд алдаа гарлаа");
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = async () => {
    if (!coverFile) return;
    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", coverFile);
      const uploadRes = await fetch("/api/upload/company-cover", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const text = await uploadRes.text();
      if (!text) {
        throw new Error("Хоосон хариу ирлээ");
      }
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("JSON parse хийхэд алдаа гарлаа");
      }

      // Update company coverImageUrl
      const updateRes = await fetch("/api/employer/company/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImageUrl: data.url }),
      });
      if (!updateRes.ok) throw new Error("Update failed");
      const textUpdated = await updateRes.text();
      if (!textUpdated) {
        throw new Error("Хоосон хариу ирлээ");
      }
      const updated = JSON.parse(textUpdated);
      setCompany(updated);
      setCoverFile(null);
      setCoverPreview(null);
      alert("Cover зураг амжилттай шинэчлэгдлээ");
    } catch (e) {
      alert("Cover зураг шинэчлэхэд алдаа гарлаа");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleEdit = (jobId: string) => {
    router.push(`/employer/jobs/edit/${jobId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Ачаалж байна...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-16    bg-white md:px-32 text-[#0C213A] font-poppins">
      {/* Cover Image/Header */}
      <div className="relative w-full h-48 md:h-64 group">
        <img
          src={
            coverPreview ||
            company?.coverImageUrl ||
            "/images/default-cover.jpg"
          }
          alt="Company cover"
          className="w-full h-full object-cover object-center transition-all duration-300"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Зураг сонгох
            </div>
          </div>
        </div>
        {coverFile && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={handleCoverUpload}
              disabled={isUploadingCover}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploadingCover ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Хадгалж байна...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Хадгалах
                </>
              )}
            </button>
            <button
              onClick={() => {
                setCoverFile(null);
                setCoverPreview(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Цуцлах
            </button>
          </div>
        )}
        <div className="absolute left-0 bottom-0 flex items-end gap-8 px-8 pb-8 w-full bg-gradient-to-t from-black/60 to-transparent">
          <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
            <img
              src={company?.logoUrl || "/images/default-company-logo.svg"}
              alt="logo"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{company?.name}</h1>
            <div className="text-base text-white/80">
              Ажлын байр: {jobs.length}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full bg-white border-b border-[#0C213A]/10">
        <nav className="flex justify-start gap-0">
          <button
            className={`px-6 py-3 text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer
              ${
                activeTab === "about"
                  ? "border-[#0C213A] text-[#0C213A]"
                  : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
              }
            `}
            onClick={() => setActiveTab("about")}
          >
            Тухай
          </button>
          <button
            className={`px-6 py-3 text-base font-medium rounded-none border-b-2 transition-all duration-200 cursor-pointer
              ${
                activeTab === "jobs"
                  ? "border-[#0C213A] text-[#0C213A]"
                  : "border-transparent text-[#0C213A]/60 hover:text-[#0C213A] hover:bg-[#0C213A]/5"
              }
            `}
            onClick={() => setActiveTab("jobs")}
          >
            Нээлттэй ажлын байр
          </button>
        </nav>
      </div>

      {/* Posted Jobs Section - энгийн жагсаалт хэлбэрээр үлдээнэ */}
      <main className="mx-auto py-10 px-2 md:px-0">
        {activeTab === "about" && (
          <div className="w-full bg-white rounded-none shadow-none p-0 mb-8 border-0">
            <div className="w-full px-0 md:px-16 py-12">
              <h2 className="text-2xl font-bold mb-4 text-[#0C213A]">
                Компанийн мэдээлэл
              </h2>
              {isEditingAbout ? (
                <>
                  <div className="mb-4">
                    <span className="block text-gray-500 font-semibold mb-1">
                      Компанийн нэр:
                    </span>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 text-lg text-[#0C213A]"
                      value={aboutEdit.name}
                      onChange={(e) =>
                        setAboutEdit((a) => ({ ...a, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="mb-4">
                    <span className="block text-gray-500 font-semibold mb-1">
                      Байршил:
                    </span>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 text-lg text-[#0C213A]"
                      value={aboutEdit.location}
                      onChange={(e) =>
                        setAboutEdit((a) => ({
                          ...a,
                          location: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="mb-4">
                    <span className="block text-gray-500 font-semibold mb-1">
                      Вэбсайт:
                    </span>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 text-lg text-blue-600"
                      value={aboutEdit.website}
                      onChange={(e) =>
                        setAboutEdit((a) => ({ ...a, website: e.target.value }))
                      }
                    />
                  </div>
                  <div className="mb-4">
                    <span className="block text-gray-500 font-semibold mb-1">
                      Тайлбар:
                    </span>
                    <textarea
                      className="w-full border rounded px-3 py-2 text-base text-gray-700"
                      rows={4}
                      value={aboutEdit.description}
                      onChange={(e) =>
                        setAboutEdit((a) => ({
                          ...a,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleAboutSave}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
                    >
                      Хадгалах
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingAbout(false);
                        setAboutEdit({
                          name: company?.name || "",
                          location: company?.location || "",
                          website: company?.website || "",
                          description: company?.description || "",
                        });
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-6 py-2 rounded-lg shadow transition"
                    >
                      Болих
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <span className="block text-gray-500 font-semibold mb-1">
                      Компанийн нэр:
                    </span>
                    <span className="text-lg text-[#0C213A]">
                      {company?.name}
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="block text-gray-500 font-semibold mb-1">
                      Байршил:
                    </span>
                    <span className="text-lg text-[#0C213A]">
                      {company?.location}
                    </span>
                  </div>
                  {company?.website && (
                    <div className="mb-4">
                      <span className="block text-gray-500 font-semibold mb-1">
                        Вэбсайт:
                      </span>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                  {company?.description && (
                    <div className="mb-4">
                      <span className="block text-gray-500 font-semibold mb-1">
                        Тайлбар:
                      </span>
                      <p className="text-base text-gray-700 whitespace-pre-line">
                        {company.description}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => setIsEditingAbout(true)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-6 py-2 rounded-lg shadow transition mt-2"
                  >
                    Засах
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {activeTab === "jobs" && (
          <>
            <h2 className="text-xl font-bold mb-4 text-[#0C213A]">
              Нээлттэй ажлын байрууд
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-3 relative"
                >
                  {/* Edit/Delete buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(job.id)}
                      className="p-2 rounded hover:bg-gray-100 transition"
                      title="Засах"
                    >
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M15.232 5.232l3.536 3.536M9 13l6-6M3 17.25V21h3.75l11.06-11.06a2.121 2.121 0 00-3-3L3 17.25z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 rounded hover:bg-gray-100 transition"
                      title="Устгах"
                    >
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {/* Title & badges */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl font-bold text-[#0C213A]">
                        {job.title}
                      </span>
                      {job.type && (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                          {job.type}
                        </span>
                      )}
                      {job.salary && (
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                          {job.salary}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Company info */}
                  <div className="flex items-center gap-3 mt-2">
                    <img
                      src={
                        company?.logoUrl || "/images/default-company-logo.svg"
                      }
                      alt="logo"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-[#0C213A]">
                        {company?.name}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                          <circle cx="12" cy="11" r="3" />
                        </svg>
                        {job.location}
                      </div>
                    </div>
                    {/* Bookmark icon (optional) */}
                    <button className="ml-auto p-2 rounded hover:bg-gray-100">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 5v14l7-7 7 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
