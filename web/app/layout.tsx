import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuizQuest - AI-Powered Quiz Generator",
  description: "Create custom quizzes on any topic with AI-powered question generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-primary-600">QuizQuest</span>
              </Link>
              <div className="flex space-x-6">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/history"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  History
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="mt-auto py-6 text-center text-gray-600">
          <p>Powered by Claude AI</p>
        </footer>
      </body>
    </html>
  );
}
