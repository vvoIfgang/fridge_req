// src/components/Header.js

import React, { useState } from "react";
import "../css/Header.css";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserMenu from "./UserMenu";
// 💡 아이콘 사용을 위해 react-icons 라이브러리가 설치되어 있다고 가정
import { FaRegUserCircle } from "react-icons/fa";

function Header() {
  const { isLoggedIn, logout, userName } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // 💡 로그아웃 후 홈으로 리디렉션하며 상태를 완전히 반영
    window.location.href = "/";
  };

  const handleToggleMenu = () => {
    // 💡 ID 또는 아이콘 클릭 시 메뉴 상태를 토글합니다.
    setIsMenuOpen((prev) => !prev);
  };

  // 💡 메뉴 외부를 클릭했을 때 닫히는 로직을 추가하는 것도 고려해 보세요.
  // 이 예시에서는 ID/아이콘 클릭으로만 토글합니다.

  return (
    <header className="main-header">
      <div className="header-inner">
        {/* 1. 로고/사이트 이름 */}
        <div className="header-logo">
          <Link to="/">Delicious Eats</Link>
        </div>

        {/* 2. 메인 카테고리 (기존 Nav 영역) */}
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

        {/* 3. 오른쪽 유틸리티 메뉴 */}
        <div className="header-utility">
          {isLoggedIn ? (
            // 💡 로그인 상태: 사용자 ID와 아이콘, 드롭다운 메뉴
            <div className="user-profile-container">
              {/* 🛠️ 사용자 ID와 아이콘을 감싸서 클릭 영역으로 만듭니다. */}
              <div
                className="user-menu-toggle"
                onClick={handleToggleMenu} // ⬅️ 클릭 이벤트 핸들러 추가
              >
                {/* 1) 사용자 이름 */}
                <span className="user-id-display">{userName} 님</span>
                {/* 2) 동그라미 아이콘 */}
                <FaRegUserCircle className="profile-icon" size={24} />
              </div>

              {/* 🛠️ isMenuOpen 상태에 따라 UserMenu 컴포넌트를 조건부 렌더링 */}
              {isMenuOpen && (
                <UserMenu
                  username={userName}
                  logout={handleLogout}
                  closeMenu={() => setIsMenuOpen(false)}
                />
              )}
            </div>
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
//npm install react-icons 라이브러리
