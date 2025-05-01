// app/profile/page.tsx
"use client";

import ProfileAndPaymentHistory from "@/components/profile/ProfileAndPaymentHistory";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <ProfileAndPaymentHistory />
      </div>
    </div>
  );
}