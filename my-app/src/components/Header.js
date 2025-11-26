// src/components/Header.js
import React from "react";
import "../css/Header.css"; // Header 전용 CSS 파일
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ⬅️ Context Hook import

function Header() {
  // 💡 Context에서 인증 상태, 로그아웃 함수, 사용자 이름을 가져옵니다.
  // 🛠️ 수정: username 추가
  const { isLoggedIn, logout, username } = useAuth();

  const handleLogout = () => {
    logout(); // Context의 로그아웃 함수 호출 (localStorage에서 토큰/사용자 이름 제거)

    // 💡 로그아웃 후 홈으로 리디렉션하며 페이지를 새로고침하여 상태를 완전히 반영합니다.
    window.location.href = "/";
  };

  return (
    <header className="main-header">
      {/* 내부 콘텐츠를 감싸는 div */}
      <div className="header-inner">
        {/* 1. 로고/사이트 이름 */}
        <div className="header-logo">
          <Link to="/">Delicious Eats</Link>
        </div>

        {/* 2. 메인 카테고리 (이미지 상단) */}
        <nav className="header-nav">
          <ul>
            <li>
              <Link to="/intro">사이트 소개</Link>
            </li>
            <li>
              <Link to="/service">사이트 제공 서비스</Link>
            </li>
            <li>
              <Link to="/tech">받아온 api와 기술</Link>
            </li>
            <li>
              <Link to="/about">개발진 소개</Link>
            </li>
          </ul>
        </nav>

        {/* 3. 오른쪽 유틸리티 메뉴 (로그인 상태에 따라 버튼 변경) */}
        <div className="header-utility">
          {isLoggedIn ? (
            // 💡 로그인 상태: 사용자 이름과 로그아웃 버튼 표시
            <>
              {/* 🛠️ 수정: 사용자 이름 표시 */}
              <span
                style={{
                  color: "#fff",
                  marginRight: "15px",
                  fontWeight: "bold",
                }}
              >
                {username} 님
              </span>
              <button
                className="utility-btn primary"
                onClick={handleLogout} // ⬅️ 클릭 이벤트 핸들러 추가
              >
                로그아웃
              </button>
            </>
          ) : (
            // 💡 로그아웃 상태: 로그인/회원가입 버튼 표시
            <>
              <Link to="/login">
                <button className="utility-btn">로그인</button>
              </Link>
              <Link to="/signup">
                <button className="utility-btn primary">회원가입</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
