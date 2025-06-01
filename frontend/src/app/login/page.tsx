"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

// 로그인 컨텐츠 컴포넌트
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggedIn } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 소셜 로그인 체크
  useEffect(() => {
    const checkLoginStatus = async () => {
      // 이미 로그인된 상태라면 메인 페이지로 리다이렉트
      if (isLoggedIn) {
        router.push("/");
        return;
      }

      // URL에 isSocialLogin이 있는 경우에만 체크
      const isSocialLogin = searchParams.get("isSocialLogin") === "true";
      if (!isSocialLogin) {
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social/me`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const userData = await response.json();
          // 실제 유저 데이터가 있을 때만 로그인 처리
          if (userData && userData.id) {
            login();
            router.push("/");
          }
        }
      } catch (error) {
        console.error("로그인 상태 확인 실패:", error);
      }
    };

    checkLoginStatus();
  }, [isLoggedIn, login, router, searchParams]); // searchParams 의존성 추가
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "로그인에 실패했습니다.");
      }

      const data = await response.json();

      // 로그인 성공 시 UserContext 업데이트
      login();

      // 메인 페이지로 이동
      router.push("/");
    } catch (error) {
      console.error("로그인 오류:", error);
      setError(
        error instanceof Error ? error.message : "로그인에 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    // 메인 페이지로 리다이렉트
    const redirectUrl = `${window.location.origin}/login?isSocialLogin=true`;
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/authorization/kakao?redirectUrl=${redirectUrl}`;
  };

  const handleNaverLogin = () => {
    // 메인 페이지로 리다이렉트
    const redirectUrl = `${window.location.origin}/login?isSocialLogin=true`;
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/authorization/naver?redirectUrl=${redirectUrl}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#49BEB7] mb-2">ANIDOC</h1>
          <h2 className="text-gray-600 text-sm">동물병원 관리 시스템</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-gray-700 mb-1"
              >
                아이디
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력해주세요"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#49BEB7] focus:border-[#49BEB7] focus:z-10 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm text-gray-700 mb-1"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해주세요"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#49BEB7] focus:border-[#49BEB7] focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#49BEB7] focus:ring-[#49BEB7] border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                로그인 상태 유지
              </label>
            </div>
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-[#49BEB7] hover:text-[#3ea9a2]"
              >
                비밀번호를 잊으셨나요?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#49BEB7] hover:bg-[#3ea9a2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#49BEB7] disabled:bg-gray-400"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-sm text-gray-600">또는</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="button"
              onClick={handleKakaoLogin}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-[#FEE500] hover:bg-[#F0D800]"
            >
              <span className="mr-2 flex items-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 1.5C4.30875 1.5 0.5 4.30875 0.5 7.75C0.5 10.025 2.01875 12.0187 4.35625 13.0812C4.16875 13.7125 3.7125 15.6625 3.6375 16.0375C3.54375 16.5125 3.825 16.5063 4.0625 16.3563C4.24375 16.2437 6.625 14.625 7.525 14.0125C8.00625 14.075 8.5 14.1125 9 14.1125C13.6913 14.1125 17.5 11.3037 17.5 7.8625C17.5 4.4212 13.6913 1.5 9 1.5Z"
                    fill="black"
                  />
                </svg>
              </span>
              카카오 계정으로 로그인
            </button>
            {/* 네이버 로그인 버튼 */}
            <button
              type="button"
              onClick={handleNaverLogin}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-[#03C75A] hover:bg-[#02b54d]"
            >
              <span className="mr-2 flex items-center">
                <img
                  src="/images/naver-login.png"
                  alt="네이버 로그인"
                  width="24"
                  height="24"
                />
              </span>
              네이버 계정으로 로그인
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            아직 계정이 없으신가요?{" "}
            <Link
              href="/register"
              className="font-medium text-[#49BEB7] hover:text-[#3ea9a2]"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// 메인 컴포넌트
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-600">로딩 중...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
