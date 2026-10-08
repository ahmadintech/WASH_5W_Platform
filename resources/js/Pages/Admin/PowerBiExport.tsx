import React, { useState, useRef } from "react";
import AppLayout from "../../layout/AppLayout";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";

export default function PowerBiExport() {
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const embedUrl =
    "https://app.powerbi.com/reportEmbed?reportId=e4522123-d8b1-4bba-a849-194287c809c4&autoAuth=true&ctid=40222b96-2fb0-47eb-80e9-382b3683f741";

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenPowerBi = () => {
    window.open(embedUrl, "_blank", "noopener,noreferrer");
    showToast("Opening Microsoft Power BI in a new tab...");
  };

  const handleReloadIframe = () => {
    setIsIframeLoading(true);
    setIframeKey((prev) => prev + 1);
    showToast("Reloading Power BI Dashboard...");
  };

  const toggleFullscreen = () => {
    if (!iframeContainerRef.current) return;

    if (!document.fullscreenElement) {
      iframeContainerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {
          showToast("Fullscreen mode could not be entered.");
        });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  return (
    <>
      <PageMeta
        title="Power BI Dashboard | WASH Sector Admin"
        description="Interactive 2026 Response Dashboard embedded from Microsoft Power BI Service."
      />

      <div className="w-full space-y-4 max-w-[1600px] mx-auto pb-12 font-sans">
        {/* Toast Alert */}
        {toast && (
          <div className="fixed top-6 right-6 z-99999 rounded-xl bg-gray-900 text-white px-5 py-3.5 shadow-2xl flex items-center gap-3 border border-amber-500 animate-in fade-in slide-in-from-top duration-300">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-gray-950 font-bold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="text-xs font-semibold text-gray-200">{toast}</div>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-amber-500 text-gray-950 font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.5 2h-3c-.28 0-.5.22-.5.5v19c0 .28.22.5.5.5h3c.28 0 .5-.22.5-.5v-19c0-.28-.22-.5-.5-.5zm-6 7h-3c-.28 0-.5.22-.5.5v12c0 .28.22.5.5.5h3c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5zm12-4h-3c-.28 0-.5.22-.5.5v16c0 .28.22.5.5.5h3c.28 0 .5-.22.5-.5v-16c0-.28-.22-.5-.5-.5z" />
                </svg>
              </span>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  2026 Response Dashboard
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  WASH Sector North East Nigeria 5W Humanitarian Response Analytics
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={handleOpenPowerBi}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-extrabold shadow-xs transition-all cursor-pointer"
            >
              <span>Open in Power BI</span>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Embedded Power BI Report Main Frame */}
        <div
          ref={iframeContainerRef}
          className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md overflow-hidden flex flex-col transition-all"
        >
          {/* Dashboard Control Bar */}
          <div className="bg-gray-900 text-white px-5 py-3 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  2026 Response Dashboard-WIP
                </span>
              </div>
              <span className="hidden sm:inline text-gray-600">|</span>
              <span className="hidden sm:inline text-xs text-gray-400">
                Microsoft Power BI Service
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReloadIframe}
                title="Reload dashboard frame"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="hidden sm:inline">Reload</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                title="Toggle Fullscreen"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              >
                {isFullscreen ? (
                  <>
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span className="hidden sm:inline">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      />
                    </svg>
                    <span className="hidden sm:inline">Fullscreen</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenPowerBi}
                title="Open in new tab"
                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Tab</span>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Iframe Viewport Container */}
          <div className="relative w-full bg-gray-950 flex-1 min-h-[620px] md:min-h-[750px] lg:min-h-[820px]">
            {isIframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 text-white z-10 gap-3">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-sm font-bold text-amber-400">
                  Loading Power BI Report...
                </div>
              </div>
            )}

            <iframe
              key={iframeKey}
              title="2026 Response Dashboard-WIP"
              width="1140"
              height="541.25"
              src={embedUrl}
              frameBorder="0"
              allowFullScreen={true}
              onLoad={() => setIsIframeLoading(false)}
              className="w-full h-full min-h-[620px] md:min-h-[750px] lg:min-h-[820px] border-0"
            />
          </div>
        </div>
      </div>
    </>
  );
}

PowerBiExport.layout = (page: any) => <AppLayout>{page}</AppLayout>;
