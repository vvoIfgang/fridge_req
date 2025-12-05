// src/context/AuthContext.js
import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. 상태 초기화 시 Access Token과 Refresh Token 모두 localStorage에서 가져옴
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );
  // ✨ Refresh Token 상태 추가 및 초기화
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken")
  );
  const [userName, setUsername] = useState(localStorage.getItem("userName"));

  // Access Token 존재 여부로 로그인 상태 판단
  const isLoggedIn = !!accessToken;

  // 2. 로그인 함수: Access/Refresh Token과 사용자 이름을 모두 저장
  const login = (access, refresh, user) => {
    // 💡 Access Token (단기)
    localStorage.setItem("accessToken", access);
    setAccessToken(access);

    // 💡 Refresh Token (장기)
    localStorage.setItem("refreshToken", refresh);
    setRefreshToken(refresh);

    // 사용자 이름
    localStorage.setItem("userName", user);
    setUsername(user);
  };

  // 3. 로그아웃 함수: 모든 토큰과 사용자 이름 제거
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken"); // ✨ Refresh Token 제거
    localStorage.removeItem("userName");

    setAccessToken(null);
    setRefreshToken(null);
    setUsername(null);
  };

  // 4. 새로운 Access Token만 갱신하는 함수 (Refresh Token 사용 로직에 필요)
  const refreshAuthToken = (newAccessToken) => {
    localStorage.setItem("accessToken", newAccessToken);
    setAccessToken(newAccessToken);
  };

  const value = {
    isLoggedIn,
    accessToken, // Access Token 제공
    refreshToken, // ✨ Refresh Token 제공
    userName,
    login,
    logout,
    refreshAuthToken, // ✨ 토큰 갱신 함수 제공
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
