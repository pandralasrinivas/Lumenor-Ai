import React from "react";
import { Loader2 } from "lucide-react";

const StartupLoader = ({ message }) => {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_24%),radial-gradient(circle_at_85%_12%,rgba(244,216,199,0.42),transparent_20%),linear-gradient(180deg,#fffdf8_0%,#fff7f0_100%)] px-6 text-[#171312]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#efc9c3]" />
          <Loader2 className="h-12 w-12 animate-spin text-[#ef5b5b]" />
        </div>

        <p className="mt-8 font-serif text-4xl tracking-[-0.06em] text-[#171312]">
          Style<span className="text-[#ef5b5b]">Up.</span>
        </p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.4em] text-[#8a7c72]">
          Loading Storefront
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-[-0.05em] sm:text-5xl">
          Please wait
        </h1>
        <p className="mt-4 max-w-sm text-base leading-7 text-[#6f635b]">
          {message}
        </p>

        <div className="mt-8 flex items-center gap-2" aria-hidden="true">
          <span
            className="startup-loader-dot h-2.5 w-2.5 rounded-full bg-[#ef5b5b]"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="startup-loader-dot h-2.5 w-2.5 rounded-full bg-[#171312]"
            style={{ animationDelay: "120ms" }}
          />
          <span
            className="startup-loader-dot h-2.5 w-2.5 rounded-full bg-[#d98c6b]"
            style={{ animationDelay: "240ms" }}
          />
        </div>
      </div>
    </div>
  );
};

export default StartupLoader;
