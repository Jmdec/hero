"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FloatingSocialMedia from "@/components/FloatingSocialMedia";
import Chatbot from "@/components/Chatbot";
import { Loading } from "@/components/Loading";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Auth pages
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-email";

  // Admin pages
  const isAdminPage = pathname.startsWith("/admin");

  // User portal pages (optional)
  const isUserPage = pathname.startsWith("/user");

  // Public pages
  const isPublicPage =
    !isAuthPage &&
    !isAdminPage &&
    !isUserPage;

  // --- Initial app load ---
  // Tracks real readiness (window load + fonts) rather than a fixed timer,
  // so the loader never finishes before assets are actually usable, and
  // never lingers once they are. Shown once per session, not per route.
  const [isAppReady, setIsAppReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    // Already loaded before this effect ran (e.g. fast cache) — skip straight through.
    if (document.readyState === "complete") {
      setLoadProgress(100);
      setIsAppReady(true);
      return;
    }

    let cancelled = false;

    // Eases progress toward 90% while waiting so the bar/percentage never
    // looks stalled, then snaps to 100% once load actually fires.
    const start = performance.now();
    let raf: number;
    const tick = (t: number) => {
      if (cancelled) return;
      const elapsed = t - start;
      setLoadProgress(90 * (1 - Math.exp(-elapsed / 1200)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const handleReady = async () => {
      try {
        if ("fonts" in document) await (document as any).fonts.ready;
      } catch {
        // Font Loading API unavailable — proceed without blocking on it.
      }
      if (cancelled) return;
      cancelled = true;
      cancelAnimationFrame(raf);
      setLoadProgress(100);
      // Small pause so the 100% state and horizon line are visible before
      // the fade-out, instead of jumping straight from ~90% to gone.
      setTimeout(() => setIsAppReady(true), 350);
    };

    window.addEventListener("load", handleReady);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("load", handleReady);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {!isAppReady && (
          <motion.div
            key="app-loading"
            className="fixed inset-0 z-100"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Loading />
          </motion.div>
        )}
      </AnimatePresence>

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

// "use client";

// import { useEffect, useRef, useState } from "react";
// import { usePathname } from "next/navigation";
// import { AnimatePresence, motion } from "framer-motion";
// import Footer from "../components/Footer";
// import FloatingSocialMedia from "@/components/FloatingSocialMedia";
// import Chatbot from "@/components/Chatbot";
// import { Loading } from "@/components/Loading";

// // How long the loader stays up on a client-side route change. There's no
// // "window load" event to hook into for these (only the very first page
// // load fires that), so this is a fixed, deliberate duration instead of a
// // real-progress measurement.
// const ROUTE_LOADING_MS = 900;

// export default function ClientLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();
//   const isFirstRender = useRef(true);

//   // --- Initial app load ---
//   // Tracks real readiness (window load + fonts) rather than a fixed timer,
//   // so the loader never finishes before assets are actually usable, and
//   // never lingers once they are.
//   const [isAppReady, setIsAppReady] = useState(false);

//   // --- Per-route load ---
//   // Shown on every subsequent navigation, not just the first load.
//   const [isRouteLoading, setIsRouteLoading] = useState(false);

//   const isLoading = !isAppReady || isRouteLoading;

//   useEffect(() => {
//     // Already loaded before this effect ran (e.g. fast cache) — skip straight through.
//     if (document.readyState === "complete") {
//       setIsAppReady(true);
//       return;
//     }

//     let cancelled = false;

//     const handleReady = async () => {
//       try {
//         if ("fonts" in document) await (document as any).fonts.ready;
//       } catch {
//         // Font Loading API unavailable — proceed without blocking on it.
//       }
//       if (cancelled) return;
//       cancelled = true;
//       setIsAppReady(true);
//     };

//     window.addEventListener("load", handleReady);

//     return () => {
//       cancelled = true;
//       window.removeEventListener("load", handleReady);
//     };
//   }, []);

//   // Re-trigger the loader on every route change after the initial load.
//   useEffect(() => {
//     if (isFirstRender.current) {
//       isFirstRender.current = false;
//       return;
//     }
//     setIsRouteLoading(true);
//     const timer = setTimeout(() => setIsRouteLoading(false), ROUTE_LOADING_MS);
//     return () => clearTimeout(timer);
//   }, [pathname]);

//   // Lock scrolling while the loader is covering the page.
//   useEffect(() => {
//     document.body.style.overflow = isLoading ? "hidden" : "";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [isLoading]);

//   // Auth pages
//   const isAuthPage =
//     pathname === "/login" ||
//     pathname === "/register" ||
//     pathname === "/verify-email";

//   // Admin pages
//   const isAdminPage = pathname.startsWith("/admin");

//   // User portal pages (optional)
//   const isUserPage = pathname.startsWith("/user");

//   // Public pages
//   const isPublicPage = !isAuthPage && !isAdminPage && !isUserPage;

//   return (
//     <>
//       <AnimatePresence>
//         {isLoading && (
//           <motion.div
//             key="app-loading"
//             className="fixed inset-0 z-100"
//             initial={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.5, ease: "easeInOut" }}
//           >
//             <Loading />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <main className={isPublicPage ? "flex-1" : "min-h-screen"}>
//         {children}
//       </main>

//       {/* Public Footer */}
//       {isPublicPage && <Footer />}

//       {/* Public Widgets */}
//       {isPublicPage && (
//         <>
//           <FloatingSocialMedia />
//           <Chatbot />
//         </>
//       )}
//     </>
//   );
// }