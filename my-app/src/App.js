// src/App.js

import React from "react";
// 1. React Router Dom에서 필요한 컴포넌트를 import 합니다.
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import HeroSection from "./components/Mainsection";
import "./css/App.css"; // 전체 페이지 스타일

// 2. Header에서 링크로 연결될 기존 페이지 컴포넌트들을 import 합니다. (경로 유지)
import IntroPage from "./components/IntroPage";
import ServicePage from "./components/ServicePage";
import TechPage from "./components/TechPage";
import AboutPage from "./components/AboutPage";

// 3. 🔑 AuthContext와 로그인/회원가입 컴포넌트를 import 합니다.
import { AuthProvider } from "./context/AuthContext"; // ⬅️ 추가
import Login from "./components/Login"; // ⬅️ 추가 (src/pages/Login.js)
import Signup from "./components/Signup"; // ⬅️ 추가 (src/pages/Signup.js)

function App() {
  return (
    // <Router>로 전체 애플리케이션을 감싸 라우팅을 활성화합니다.
    <Router>
      {/* 💡 AuthProvider로 전체 앱을 감싸서 어디서든 인증 상태에 접근 가능하게 합니다. */}
      <AuthProvider>
        <div className="app-main-layout">
          {/* Header는 모든 페이지 상단에 고정적으로 표시됩니다. */}
          <Header />

          {/* <Routes> 안에 <Route>들을 정의하여 URL 경로와 컴포넌트를 연결합니다. */}
          <Routes>
            {/* 4. 기본 경로: '/'에 접속했을 때 HeroSection을 보여줍니다. */}
            <Route path="/" element={<HeroSection />} />
            {/* 5. Header 메뉴 링크에 해당하는 경로와 컴포넌트를 매핑합니다. */}
            <Route path="/intro" element={<IntroPage />} />
            <Route path="/service" element={<ServicePage />} />
            <Route path="/tech" element={<TechPage />} />
            <Route path="/about" element={<AboutPage />} />
            {/* 6. 🔐 로그인/회원가입 페이지의 경로를 추가합니다. */}
            <Route path="/login" element={<Login />} /> {/* ⬅️ 추가 */}
            <Route path="/signup" element={<Signup />} /> {/* ⬅️ 추가 */}
          </Routes>
        </div>
      </AuthProvider>{" "}
      {/* ⬅️ AuthProvider 닫기 */}
    </Router>
  );
}

export default App;
