"use client";

import { usePathname } from "next/navigation";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Hide navigation and footer on login and register pages
  const isAuthPage = pathname === "/login" || pathname === "/register";
  
  return (
    <>
      {!isAuthPage && <Navigation />}
      <main className={isAuthPage ? "min-h-screen" : "flex-1"}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}
