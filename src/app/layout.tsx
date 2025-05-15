import { Inter } from "next/font/google";
import { AuthProvider } from "@/providers/AuthProvider";
import { ChatProvider } from "@/providers/ChatProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { Header } from "@/components/Navigation";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const metadata = {
  title: "CV Analyzer",
  description: "Upload and analyze your CV using AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <AuthProvider>
          <ChatProvider>
            <NotificationProvider>
              <Header />
              {children}
            </NotificationProvider>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
