"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useNotification } from "@/providers/NotificationProvider";

gsap.registerPlugin(CustomEase);

export default function EmployerLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotification();

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pageRef.current && formRef.current && imageRef.current && overlayRef.current) {
      // Create a timeline for coordinated animations
      const tl = gsap.timeline({
        onComplete: () => {
          router.push('/employer/register');
        }
      });

      // Animate form elements out
      tl.to(formRef.current.children, {
        opacity: 0,
        y: -5,
        duration: 0.3,
        stagger: 0.02,
        ease: "power1.in"
      });

      // Animate image out
      tl.to(imageRef.current, {
        opacity: 0,
        x: -10,
        duration: 0.3,
        ease: "power1.in"
      }, "-=0.2");

      // Animate page out
      tl.to(pageRef.current, {
        opacity: 0,
        scale: 0.99,
        duration: 0.3,
        ease: "power1.in"
      }, "-=0.2");

      // Fade in white overlay
      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power1.in"
      }, "-=0.2");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        expectedRole: "EMPLOYER",
        redirect: false,
      });

      if (result?.error) {
        addNotification(
          result.error ||
            "Имэйл, нууц үг буруу эсвэл танд нэвтрэх эрх байхгүй байна.",
          "error"
        );
      } else if (result?.ok) {
        router.push("/");
      } else {
        addNotification("Нэвтрэхэд тодорхойгүй алдаа гарлаа.", "error");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      addNotification(error.message || "Нэвтрэх үед системийн алдаа гарлаа.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div ref={overlayRef} className="fixed inset-0 bg-white opacity-0 pointer-events-none z-50" />
      <div ref={pageRef} className="w-[1915px] h-[947px] relative bg-white overflow-hidden">
        {/* Баруун талын illustration */}
        <Image 
          ref={imageRef}
          src="/icons/employer.svg" 
          alt="Job Icon" 
          width={720} 
          height={520} 
          className="absolute left-[970px] top-[120px]" 
        />
        {/* Бүртгүүлэх холбоос */}
        <div className="absolute left-[1370px] top-[800px] flex items-center gap-2">
          <span className="text-[#0C213A] text-[20px] font-normal font-poppins">Бүртгэлгүй юу?</span>
          <a 
            href="/employer/register" 
            onClick={handleRegisterClick}
            className="text-[#0C213A] text-[20px] font-bold font-poppins hover:underline"
          >
            Бүртгүүлэх
          </a>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-[110px]">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
              Ажил олгогч нэвтрэх
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Та өөрийн бүртгэлтэй имэйл хаяг, нууц үгээ оруулна уу
            </p>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <form className="space-y-6" onSubmit={handleSubmit} ref={formRef}>
                <div className="flex flex-col gap-[25px] w-[564px] mb-[20px]">
                  <div className="flex flex-col gap-[5px]">
                    <div className="flex flex-col gap-[4px]">
                      <div className="h-[27px] text-[#0C213A] text-[16px] font-poppins">Имэйл хаяг</div>
                    </div>
                    <input 
                      name="email" 
                      className="h-[60px] rounded-xl bg-white border border-[#0C213A]/20 outline-none px-4 w-full text-[#0C213A]" 
                    />
                  </div>
                  <div className="flex flex-col gap-[5px]">
                    <div className="flex flex-col gap-[4px]">
                      <div className="h-[27px] text-[#0C213A] text-[16px] font-poppins">Нууц үг</div>
                    </div>
                    <div className="relative">
                      <input 
                        name="password" 
                        type={showPassword ? "text" : "password"}
                        className="h-[60px] rounded-xl bg-white border border-[#0C213A]/20 outline-none px-4 w-full text-[#0C213A]" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="#0C213A" fillOpacity="0.4"/>
                          </svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.83L19.56 16.75C21.07 15.49 22.26 13.86 22.99 12C21.26 7.61 16.99 4.5 11.99 4.5C10.59 4.5 9.25 4.75 8.01 5.2L10.17 7.36C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.74 7.01C3.08 8.3 1.78 10.02 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.8 19.08L19.73 22L21 20.73L3.27 3L2 4.27ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM11.84 9.02L14.99 12.17L15.01 12.01C15.01 10.35 13.67 9.01 12.01 9.01L11.84 9.02Z" fill="#0C213A" fillOpacity="0.4"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-[564px] mb-[190px]">
                  <button type="button" className="flex items-center gap-2">
                    <img src="/icons/google1.svg" alt="Google Icon" width={22} height={22} />
                    <span className="text-[#0C213A] text-[14px] font-poppins">Google-ээр нэвтрэх</span>
                  </button>
                  <a href="#" className="text-[#0C213A] text-[14px] font-light font-poppins">Нууц үг мартсан уу?</a>
                </div>

                <button type="submit" className="w-[564px] py-[13px] bg-[#0C213A] rounded-[10px] flex items-center justify-center">
                  <span className="text-white text-[20px] font-bold font-poppins">Нэвтрэх</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
