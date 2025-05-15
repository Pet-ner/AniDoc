"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface User {
  id: number;
  name: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (userId: number) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// 하드코딩 유저 데이터 (실제 h2 db에 입력된 데이터들)
const MOCK_USERS = {
  1: { id: 1, name: "일반 사용자", role: "ROLE_USER" },
  2: { id: 2, name: "의료진", role: "ROLE_STAFF" },
  3: { id: 3, name: "관리자", role: "ROLE_ADMIN" },
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 초기 로그인 상태 설정 (테스트용)
    const userId = 1; // 일반 사용자로 기본 설정

    // @ts-ignore - 타입 체크 우회
    setUser(MOCK_USERS[userId]);
    setIsLoading(false);

    // 로컬 스토리지에 저장
    localStorage.setItem("userId", userId.toString());
  }, []);

  const login = (userId: number) => {
    // @ts-ignore - 타입 체크 우회
    setUser(MOCK_USERS[userId]);
    localStorage.setItem("userId", userId.toString());
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userId");
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout }}>
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
