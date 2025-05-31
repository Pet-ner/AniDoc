"use client";

import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import StaffList from "@/components/staff-management/StaffList";

export default function StaffManagementPage() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // 권한 체크
    if (
      !user ||
      (user.userRole !== "ROLE_STAFF" && user.userRole !== "ROLE_ADMIN")
    ) {
      router.push("/");
    }
  }, [user, router]);

  if (
    !user ||
    (user.userRole !== "ROLE_STAFF" && user.userRole !== "ROLE_ADMIN")
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex justify-center w-full">
        <div className="w-full">
          <StaffList />
        </div>
      </div>
    </div>
  );
}
