"use client";

import { googleLogin, sendMagicLink } from "@/actions/auth.action";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 relative" onClick={(e) => e.stopPropagation()}>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-center mb-4">
          Sign in to continue
        </h2>

        {/* ✅ Google Login */}
        <form action={googleLogin} className="mb-4">
          <button className="w-full py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">
            Continue with Google
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="px-2 text-sm text-gray-500">OR</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        {/* ✅ Magic Link Form */}
        <form action={sendMagicLink} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full px-3 py-2 border rounded-lg"
          />

          <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Send Magic Link
          </button>
        </form>

      </div>
    </div>
  );
}
