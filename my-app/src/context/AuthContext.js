// src/context/AuthContext.js
import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. 상태 초기화 시 모든 정보 (Access Token, Refresh Token, 사용자 이름, 역할)를 localStorage에서 가져옴
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );

  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken")
  );

  const [userName, setUsername] = useState(localStorage.getItem("userName"));

  // ✨ 사용자 역할(Role) 상태 추가 및 초기화
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));

  // Access Token 존재 여부로 로그인 상태 판단
  const isLoggedIn = !!accessToken;

  // 2. 로그인 함수: Access/Refresh Token, 사용자 이름, 사용자 역할을 모두 저장
  // ⭐ 역할(role) 인자 추가됨
  const login = (access, refresh, user, role) => {
    // 💡 Access Token (단기)
    localStorage.setItem("accessToken", access);
    setAccessToken(access);

    // 💡 Refresh Token (장기)
    localStorage.setItem("refreshToken", refresh);
    setRefreshToken(refresh);

    // 사용자 이름
    localStorage.setItem("userName", user);
    setUsername(user);

    // ⭐ 사용자 역할(Role) 저장
    localStorage.setItem("userRole", role);
    setUserRole(role);
  };

  // 3. 로그아웃 함수: 모든 토큰, 사용자 이름 및 역할 제거
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");

    setAccessToken(null);
    setRefreshToken(null);
    setUsername(null);
    setUserRole(null);
  };

  // 4. 새로운 Access Token만 갱신하는 함수 (Refresh Token 사용 로직에 필요)
  const refreshAuthToken = (newAccessToken) => {
    localStorage.setItem("accessToken", newAccessToken);
    setAccessToken(newAccessToken);
  };

  const value = {
    isLoggedIn,
    accessToken,
    refreshToken,
    userName,
    userRole, // ✨ userRole 상태 제공
    login,
    logout,
    refreshAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
