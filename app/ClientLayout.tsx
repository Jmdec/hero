"use client";

import { usePathname } from "next/navigation";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FloatingSocialMedia from "@/components/FloatingSocialMedia";
import Chatbot from "@/components/Chatbot";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Auth pages
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register";

  // Admin pages
  const isAdminPage = pathname.startsWith("/admin");

  // User portal pages (optional)
  const isUserPage = pathname.startsWith("/user");

  // Public pages
  const isPublicPage =
    !isAuthPage &&
    !isAdminPage &&
    !isUserPage;

  return (
    <>
      {/* Public Navigation */}
      {isPublicPage && <Navigation />}

      {/* User Navigation */}
      {/* {isUserPage && <UserNavigation />} */}

      <main
        className={
          isPublicPage
            ? "flex-1"
            : "min-h-screen"
        }
      >
        {children}
      </main>

      {/* Public Footer */}
      {isPublicPage && <Footer />}

      {/* Public Widgets */}
      {isPublicPage && (
        <>
          <FloatingSocialMedia />
          <Chatbot />
        </>
      )}
    </>
  );
}