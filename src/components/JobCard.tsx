"use client";

import { useState } from "react";
import { JobListing } from "./types";

export const JobCard = ({ title, type, salary, company }: JobListing) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className={`relative overflow-hidden bg-white rounded-xl shadow-md transition-all duration-300 ${
        isHovered ? "shadow-xl transform -translate-y-1" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

      <div className="p-6">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
              {type}
            </span>
            <span className="text-sm text-gray-600">{salary}</span>
          </div>
        </div>

        <div className="flex items-center pt-4 border-t border-gray-100">
          <div className="relative mr-4">
            <img
              src={company.logo}
              className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1"
              alt={company.name}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900">
              {company.name}
            </h4>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <svg
                className="w-4 h-4 mr-1 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {company.location}
            </div>
          </div>

          <button
            className={`ml-4 p-2 rounded-full transition-colors duration-300 ${
              isHovered
                ? "bg-blue-50 text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label="Bookmark job"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
};
