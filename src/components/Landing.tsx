"use client";

import Link from "next/link";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1a1a2e] to-[#16213e] text-white relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#57CC99]/20 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-10 -right-10 w-96 h-96 bg-[#80ED99]/15 rounded-full filter blur-3xl animate-ping" />

      {/* Content */}
      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center z-10 relative">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#80ED99] via-[#57CC99] to-[#38A3A5] bg-clip-text text-transparent animate-textShine">
          CampusVerse
        </h1>
        <Link href="/auth" className="px-6 py-2 rounded-full bg-[#80ED99] text-[#0f172a] font-semibold shadow-lg hover:brightness-110 transition-transform active:scale-95">
          Sign&nbsp;In
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center text-center px-6 z-10 relative">
        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl mb-6 animate-slideDown">
          Connect, Share, and Thrive on Your Campus
        </h2>
        <p className="max-w-xl text-lg md:text-xl text-white/80 mb-8 animate-fadeIn">
          CampusVerse is your private social hub where students exchange ideas, stories, and opportunities—exclusively within your college community.
        </p>
        <Link href="/auth" className="px-8 py-4 rounded-full bg-gradient-to-r from-[#80ED99] via-[#57CC99] to-[#38A3A5] text-[#0f172a] font-bold shadow-xl hover:scale-105 hover:shadow-2xl transition-transform active:scale-95">
          Get Started
        </Link>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-sm text-white/60 z-10 relative">
        © {new Date().getFullYear()} CampusVerse. All rights reserved.
      </footer>
    </div>
  );
}
