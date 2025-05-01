"use client";

import { useState, useEffect } from "react";
import { JobCard } from "./JobCard";
import { JobListing } from "./types";

// Sample job data with more variety
const jobs: JobListing[] = [
  {
    title: "Маркетинг менежер",
    type: "бҮТЭН ЦАГ",
    salary: "Цалин: 1.5сая - $25,000",
    company: {
      name: "Tavan Bogd group",
      logo: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/23813725c8b2f39dd1d36d4e94e16d8ab78110aa?placeholderIfAbsent=true",
      location: "Улаанбаатар,Хан-Уул",
    },
  },
  {
    title: "Программист",
    type: "бҮТЭН ЦАГ",
    salary: "Цалин: 2сая - $35,000",
    company: {
      name: "TechCorp",
      logo: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/23813725c8b2f39dd1d36d4e94e16d8ab78110aa?placeholderIfAbsent=true",
      location: "Улаанбаатар,СБД",
    },
  },
  {
    title: "UX/UI Дизайнер",
    type: "бҮТЭН ЦАГ",
    salary: "Цалин: 1.8сая - $30,000",
    company: {
      name: "Design Studio",
      logo: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/23813725c8b2f39dd1d36d4e94e16d8ab78110aa?placeholderIfAbsent=true",
      location: "Улаанбаатар,Чингэлтэй",
    },
  },
  {
    title: "Маркетинг менежер",
    type: "бҮТЭН ЦАГ",
    salary: "Цалин: 1.5сая - $25,000",
    company: {
      name: "Tavan Bogd group",
      logo: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/23813725c8b2f39dd1d36d4e94e16d8ab78110aa?placeholderIfAbsent=true",
      location: "Улаанбаатар,Хан-Уул",
    },
  },
  {
    title: "Программист",
    type: "бҮТЭН ЦАГ",
    salary: "Цалин: 2сая - $35,000",
    company: {
      name: "TechCorp",
      logo: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/23813725c8b2f39dd1d36d4e94e16d8ab78110aa?placeholderIfAbsent=true",
      location: "Улаанбаатар,СБД",
    },
  },
  {
    title: "UX/UI Дизайнер",
    type: "бҮТЭН ЦАГ",
    salary: "Цалин: 1.8сая - $30,000",
    company: {
      name: "Design Studio",
      logo: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/23813725c8b2f39dd1d36d4e94e16d8ab78110aa?placeholderIfAbsent=true",
      location: "Улаанбаатар,Чингэлтэй",
    },
  },
  {
    title: "Маркетинг менежер",
    type: "бҮТЭН ЦАГ",
    salary: "Цалин: 1.5сая - $25,000",
    company: {
      name: "Tavan Bogd group",
      logo: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/23813725c8b2f39dd1d36d4e94e16d8ab78110aa?placeholderIfAbsent=true",
      location: "Улаанбаатар,Хан-Уул",
    },
  },
  {
    title: "Программист",
    type: "бҮТЭН ЦАГ",
    salary: "Цалин: 2сая - $35,000",
    company: {
      name: "TechCorp",
      logo: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/23813725c8b2f39dd1d36d4e94e16d8ab78110aa?placeholderIfAbsent=true",
      location: "Улаанбаатар,СБД",
    },
  },
  {
    title: "UX/UI Дизайнер",
    type: "бҮТЭН ЦАГ",
    salary: "Цалин: 1.8сая - $30,000",
    company: {
      name: "Design Studio",
      logo: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/23813725c8b2f39dd1d36d4e94e16d8ab78110aa?placeholderIfAbsent=true",
      location: "Улаанбаатар,Чингэлтэй",
    },
  },
];

// Animated JobCard wrapper component
const AnimatedJobCard = ({
  job,
  index,
}: {
  job: JobListing;
  index: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100 + index * 100);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <JobCard {...job} />
    </div>
  );
};

export default function JobListingSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <section className="py-24 px-4 w-full bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Онцлох компаниуд
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Монгол улсын тэргүүний компаниудын санал болгож буй ажлын байр
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <AnimatedJobCard key={index} job={job} index={index} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300">
            Бүх ажлын байрыг харах
          </button>
        </div>
      </div>
    </section>
  );
}
