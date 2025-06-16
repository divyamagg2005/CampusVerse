"use client";

import { useState } from "react";
import PostCreator from "@/components/PostCreator";

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-accent via-secondary to-success text-background shadow-xl hover:brightness-110 active:scale-95 transition-transform focus:outline-none"
        aria-label="Create Post"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modal Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <PostCreator onSuccess={() => setOpen(false)} />
            <button
              className="absolute -top-3 -right-3 bg-primary text-background rounded-full p-1 shadow-lg hover:brightness-110"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
