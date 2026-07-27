import React from "react";
import { Link } from "react-router-dom";
import {
  BadgePercent,
  Heart,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

const showcasePerks = [
  {
    icon: Truck,
    title: "Free Shipping",
    copy: "On all orders over $59",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    copy: "100% secure payment",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    copy: "30-day return policy",
  },
];

const accountPerks = [
  {
    icon: BadgePercent,
    title: "Exclusive Offers",
    copy: "Get special deals and discounts",
  },
  {
    icon: Sparkles,
    title: "Personalized Style",
    copy: "Recommendations just for you",
  },
  {
    icon: Heart,
    title: "Wishlist",
    copy: "Save your favorite items",
  },
];

const AuthLayout = ({
  mode,
  title,
  subtitle,
  children,
  footerPrompt,
  footerActionLabel,
  footerActionTo,
}) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98),transparent_24%),radial-gradient(circle_at_80%_12%,rgba(242,216,194,0.55),transparent_22%),linear-gradient(180deg,#fffdf8_0%,#fff8f2_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-[1500px] gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-[linear-gradient(180deg,#fffaf4_0%,#f7efe6_52%,#f3e8de_100%)] p-8 shadow-[0_36px_120px_-74px_rgba(71,43,27,0.48)] sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.88),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(245,214,193,0.45),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(239,226,214,0.42),transparent_28%)]" />

          <div className="relative z-10 flex h-full flex-col">
            <Link to="/" className="inline-flex w-fit flex-col">
              <span className="font-serif text-5xl leading-none tracking-[-0.06em] text-[#171312]">
                Style<span className="text-[#ef5b5b]">Up.</span>
              </span>
              <span className="mt-2 text-xs font-semibold uppercase tracking-[0.42em] text-[#6f635b]">
                Fashion Store
              </span>
            </Link>

            <div className="mt-16 max-w-xl">
              <h1 className="font-serif text-6xl leading-[0.95] tracking-[-0.06em] text-[#171312] sm:text-7xl">
                Your Style,
                <span className="mt-3 block text-[#ef5b5b]">Your Way.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-9 text-[#5f5550]">
                Discover the latest trends in fashion and express your unique
                style through elevated essentials and easy everyday pieces.
              </p>
            </div>

            <div className="mt-10 grid gap-5">
              {showcasePerks.map((perk) => {
                const Icon = perk.icon;

                return (
                  <div key={perk.title} className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f9eee3] text-[#171312] shadow-[0_12px_30px_-26px_rgba(61,39,24,0.55)]">
                      <Icon size={22} />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-[#171312]">
                        {perk.title}
                      </p>
                      <p className="mt-1 text-base text-[#695e57]">{perk.copy}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative mt-auto hidden min-h-[360px] overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,#fffaf5_0%,#f4e7da_100%)] shadow-[0_26px_90px_-68px_rgba(61,39,24,0.4)] lg:block">
              <div className="absolute inset-x-12 bottom-20 h-2 rounded-full bg-[linear-gradient(90deg,#bca28e_0%,#8d7768_52%,#bca28e_100%)]" />
              <div className="absolute left-12 bottom-20 h-36 w-2 rounded-full bg-[#8d7768]" />
              <div className="absolute right-12 bottom-20 h-36 w-2 rounded-full bg-[#8d7768]" />
              <div className="absolute left-20 bottom-20 h-44 w-24 rounded-t-[1.4rem] rounded-b-[2.4rem] bg-[linear-gradient(180deg,#d8c4b3_0%,#b89f8d_100%)] shadow-[0_28px_70px_-44px_rgba(82,57,38,0.42)]" />
              <div className="absolute left-[9.7rem] bottom-20 h-40 w-24 rounded-t-[1.4rem] rounded-b-[2.4rem] bg-[linear-gradient(180deg,#fbf6ef_0%,#e8ddd0_100%)] shadow-[0_28px_70px_-44px_rgba(82,57,38,0.3)]" />
              <div className="absolute left-[16rem] bottom-20 h-46 w-28 rounded-t-[1.4rem] rounded-b-[2.6rem] bg-[linear-gradient(180deg,#6e7f96_0%,#37516f_100%)] shadow-[0_28px_70px_-44px_rgba(40,56,78,0.52)]" />
              <div className="absolute left-[25.5rem] bottom-14 h-28 w-28 rounded-[1.8rem] bg-[linear-gradient(180deg,#bf7d49_0%,#8c4d23_100%)] shadow-[0_28px_70px_-44px_rgba(82,57,38,0.5)]" />
              <div className="absolute left-[20rem] bottom-4 h-12 w-24 rounded-[999px] bg-[linear-gradient(180deg,#f7f1e7_0%,#d8c8b1_100%)] shadow-[0_18px_40px_-30px_rgba(61,39,24,0.36)]" />
              <div className="absolute left-10 bottom-6 h-14 w-14 rounded-[1.1rem] bg-[#ded8cd] shadow-[0_18px_40px_-30px_rgba(61,39,24,0.28)]" />
              <div className="absolute right-8 top-8 rounded-[1.5rem] border border-white/80 bg-white/[0.88] px-5 py-4 shadow-[0_22px_60px_-42px_rgba(61,39,24,0.32)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#a06a5d]">
                  Capsule Wardrobe
                </p>
                <p className="mt-2 font-serif text-3xl tracking-[-0.05em] text-[#171312]">
                  Curated Essentials
                </p>
                <p className="mt-2 max-w-[14rem] text-sm leading-6 text-[#6a6059]">
                  Save favorites, revisit recent looks, and keep your style edit
                  in one place.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2.4rem] border border-white/75 bg-white/[0.92] p-6 shadow-[0_36px_120px_-74px_rgba(71,43,27,0.3)] sm:p-8 lg:p-10">
          <div className="mx-auto flex h-full w-full max-w-[760px] flex-col">
            <div className="grid grid-cols-2 gap-8 border-b border-[#ece1d6] pb-5">
              <Link
                to="/login"
                className={`relative pb-2 text-center text-3xl font-semibold transition ${
                  mode === "login"
                    ? "text-[#171312]"
                    : "text-[#8b7f77] hover:text-[#171312]"
                }`}
              >
                Log In
                {mode === "login" && (
                  <span className="absolute inset-x-0 -bottom-[1.3rem] mx-auto h-[3px] w-44 rounded-full bg-[#ef5b5b]" />
                )}
              </Link>
              <Link
                to="/register"
                className={`relative pb-2 text-center text-3xl font-semibold transition ${
                  mode === "register"
                    ? "text-[#171312]"
                    : "text-[#8b7f77] hover:text-[#171312]"
                }`}
              >
                Register
                {mode === "register" && (
                  <span className="absolute inset-x-0 -bottom-[1.3rem] mx-auto h-[3px] w-44 rounded-full bg-[#ef5b5b]" />
                )}
              </Link>
            </div>

            <div className="mt-12 text-center">
              <h2 className="text-5xl font-semibold tracking-[-0.04em] text-[#171312]">
                {title}
              </h2>
              <p className="mt-4 text-lg text-[#6f635b]">{subtitle}</p>
            </div>

            <div className="mt-10">{children}</div>

            <p className="mt-8 text-center text-base text-[#6f635b]">
              {footerPrompt}{" "}
              <Link
                to={footerActionTo}
                className="font-semibold text-[#ef5b5b] transition hover:text-[#d94d4d]"
              >
                {footerActionLabel}
              </Link>
            </p>

            <div className="mt-auto border-t border-[#ece1d6] pt-8">
              <div className="grid gap-5 sm:grid-cols-3">
                {accountPerks.map((perk) => {
                  const Icon = perk.icon;

                  return (
                    <div key={perk.title} className="text-center sm:text-left">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fbf5ef] text-[#171312] sm:mx-0">
                        <Icon size={22} />
                      </div>
                      <p className="mt-4 text-lg font-semibold text-[#171312]">
                        {perk.title}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#6f635b]">
                        {perk.copy}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthLayout;
