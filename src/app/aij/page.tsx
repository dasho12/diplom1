"use client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import CVUploadWithProfile from "@/components/CVUploadWithProfile";
import { useState } from "react";
import Link from "next/link";

interface JobMatch {
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
    location: string;
    salary?: string;
    requirements: string;
  };
  matchScore: number;
  matchDetails: {
    experience: number;
    skills: number;
    education: number;
    overall: number;
  };
}

export default function Home() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [noMatches, setNoMatches] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysisComplete = (
    analysisResult: string,
    matches: JobMatch[] | null
  ) => {
    setAnalysis(analysisResult);
    if (matches) {
      setJobMatches(matches);
      setNoMatches(false);
    } else {
      setNoMatches(true);
      setJobMatches([]);
    }
    setIsLoading(false);
  };

  const handleAnalysisStart = () => {
    setIsLoading(true);
    setAnalysis(null);
    setJobMatches([]);
    setNoMatches(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">
            AI CV Шинжилгээ
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            CV-гээ байршуулж, AI-ийн тусламжтайгаар шууд шинжилгээгээ авна уу
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-[#0C213A] rounded-lg hover:bg-[#0C213A]/90 transition-colors"
          >
            Бүх ажлын байруудыг харах
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              CV-гээ байршуулах
            </h2>
            <CVUploadWithProfile
              onAnalysisStart={handleAnalysisStart}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                Шинжилгээний үр дүн
              </h2>
              <div className="max-h-[400px] overflow-y-auto pr-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-600 text-lg font-medium">
                      Шинжилгээ хийж байна...
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                      Түр хүлээнэ үү
                    </p>
                  </div>
                ) : analysis ? (
                  <div className="prose prose-sm max-w-none text-slate-700">
                    {analysis.split("\n").map((line, index) => (
                      <p key={index} className="mb-3">
                        {line}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <p>
                      CV-гээ байршуулсны дараа шинжилгээний үр дүн энд харагдана
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                Тохирох ажлын байрууд
              </h2>
              <div className="max-h-[400px] overflow-y-auto pr-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-600 text-lg font-medium">
                      Ажлын байруудыг хайж байна...
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                      Түр хүлээнэ үү
                    </p>
                  </div>
                ) : noMatches ? (
                  <div className="p-6 bg-slate-50 rounded-xl">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">
                      Тохирох ажлын байр олдсонгүй
                    </h3>
                    <p className="text-slate-700">
                      Таны CV-тэй тохирох ажлын байр олдсонгүй. Үүний шалтгаан
                      нь:
                    </p>
                    <ul className="list-disc list-inside mt-3 text-slate-700 space-y-2">
                      <li>
                        Таны ур чадвар одоогийн ажлын шаардлагатай зүйлтэй
                        тохирохгүй байж болно
                      </li>
                      <li>Одоогоор тохирох ажлын байр байхгүй байж болно</li>
                      <li>
                        CV-гээ илүү тохирох ур чадвар, туршлагаар шинэчлэхийг
                        оролдоно уу
                      </li>
                    </ul>
                  </div>
                ) : jobMatches.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {jobMatches.map((match) => (
                      <Link
                        href={`/jobs?selectedJob=${match.job.id}`}
                        key={match.job.id}
                        className="block hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4">
                          {/* Match Score Badge */}
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-green-50 text-green-700 mr-2">
                            {Math.round(match.matchScore)}% ТОХИРОЛТ
                          </span>
                          {/* Logo (placeholder) */}
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                            <img
                              src="https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/23813725c8b2f39dd1d36d4e94e16d8ab78110aa?placeholderIfAbsent=true"
                              alt="logo"
                              className="w-10 h-10 object-contain"
                            />
                          </div>
                          {/* Job info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {match.job.title}
                            </h3>
                            <p className="text-md text-gray-600 truncate">
                              {match.job.company.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {match.job.location}
                            </p>
                            {match.job.salary && (
                              <p className="text-sm text-gray-500 truncate">
                                {match.job.salary}
                              </p>
                            )}
                          </div>
                          {/* Arrow icon */}
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <p>
                      CV-гээ байршуулсны дараа тохирох ажлын байрууд энд
                      харагдана
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
