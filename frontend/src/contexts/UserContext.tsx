"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { usePathname, useRouter } from "next/navigation";

interface VetInfo {
  id: number;
  vetName: string;
}

interface User {
  id: number;
  name: string;
  userRole: string;
  email?: string;
  password?: string;
  vetId?: VetInfo;
  phoneNumber?: string;
  emergencyContact?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  fetchUserInfo: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// 인증 없이 접근 가능한 경로
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/register/user",
  "/register/staff",
  "/auth-register",
  "/auth-register/user",
  "/auth-register/staff",
];

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    // 클라이언트 측에서만 실행되도록
    if (typeof window !== "undefined") {
      return localStorage.getItem("isLoggedIn") === "true";
    }
    return false;
  });

  const isPublicPath = (path: string) => {
    return PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath));
  };

  // 유저 정보 조회
  const fetchUserInfo = async () => {
    // 로그인 상태가 아니면 API 호출하지 않음
    if (!isLoggedIn) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // 인증 실패 - 로그인 상태 초기화
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("isLoggedIn");

        // 인증이 필요한 페이지에 있으면 로그인 페이지로 리다이렉트
        const currentPath = pathname || "";
        if (!isPublicPath(currentPath)) {
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("유저 정보 조회 오류:", error);
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem("isLoggedIn");
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 렌더링시 로그인 상태면 유저 정보 조회
  useEffect(() => {
    // 로그인 상태인 경우에만 유저 정보 조회
    if (isLoggedIn) {
      fetchUserInfo();
    }

    // 인증 상태에 따른 리다이렉션 처리
    const currentPath = pathname || "";
    if (isLoggedIn && isPublicPath(currentPath)) {
      router.push("/");
    } else if (!isLoggedIn && !isPublicPath(currentPath)) {
      router.push("/login");
    }
  }, [isLoggedIn, pathname]);

  const login = async () => {
    try {
      // 유저 정보 가져오기
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("유저 정보를 가져오는데 실패했습니다.");
      }

      const userData = await response.json();
      setUser(userData);

      // 로그인 상태 설정
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");

      // 홈으로 리다이렉트
      router.push("/");
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
    }
  };

  const logout = async () => {
    try {
      // 로그아웃 요청
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    } finally {
      // 클라이언트 상태 초기화
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem("isLoggedIn");

      // 로그인 페이지로 리다이렉트
      router.push("/login");
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn,
        login,
        logout,
        fetchUserInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser는 UserProvider 범위 안에서 쓸 수 있습니다.");
  }
  return context;
}
