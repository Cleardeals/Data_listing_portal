"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <main>
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Redirecting to search...</div>
      </div>
    </main>
  );
}
