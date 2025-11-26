// src/context/AuthContext.js
import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 🛠️ 수정: localStorage에서 토큰과 함께 사용자 이름도 가져옵니다.
  const [userToken, setUserToken] = useState(localStorage.getItem("userToken"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const isLoggedIn = !!userToken;

  // 🛠️ 수정: 로그인 함수에 사용자 이름 인자를 추가합니다.
  const login = (token, user) => {
    localStorage.setItem("userToken", token);
    localStorage.setItem("username", user); // 사용자 이름 저장
    setUserToken(token);
    setUsername(user); // 상태 업데이트
  };

  // 로그아웃 함수 (토큰 및 사용자 이름 제거)
  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("username"); // 사용자 이름 제거
    setUserToken(null);
    setUsername(null); // 상태 업데이트
  };

  const value = {
    isLoggedIn,
    userToken,
    username, // ⬅️ Context에 사용자 이름 제공
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
