"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const socailLoginForKakaoUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/authorization/kakao`;
  const redirectUrlAfterSocialLogin = `${process.env.NEXT_PUBLIC_FRONT_BASE_URL}/login`;

  return (
    <div className="flex-1 flex justify-center items-center">
      <a
        href={`${socailLoginForKakaoUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
      >
        <span className="font-bold text-2xl">카카오 로그인</span>
      </a>
    </div>
  );
}
