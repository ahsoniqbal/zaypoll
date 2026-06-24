"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";

export default function ToastHandler({ message }: { message?: string }) {
  // const router = useRouter();

  useEffect(() => {
    if (message) {
      toast.success(message);
      // router.replace("/", {
      //   scroll: false
      // });
      window.history.replaceState({}, "", "/");
    }
  }, [message]); //, router

  return null;
}
