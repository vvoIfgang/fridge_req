import React, { useState } from "react";
import "../css/Header.css";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaRegUserCircle, FaBars, FaTimes } from "react-icons/fa";
import UserMenu from "./UserMenu"; // PC용 드롭다운 메뉴
import MobileMenuPanel from "./MobileMenuPanel";

function Header() {
  const { isLoggedIn, logout, userName } = useAuth();
  // 통합 모바일 메뉴 상태
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // PC용 드롭다운 메뉴 상태 (PC에서만 사용)
  const [isPcMenuOpen, setIsPcMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsPcMenuOpen(false); // PC 메뉴도 닫기
    window.location.href = "/";
  };

  // 햄버거/X 버튼 클릭 시 통합 메뉴 토글 (모바일용)
  const handleToggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setIsPcMenuOpen(false); // 모바일 메뉴 열릴 때 PC 메뉴 닫기
  };

  // PC 프로필 클릭 시 드롭다운 메뉴 토글 (PC용)
  const handleTogglePcMenu = () => {
    setIsPcMenuOpen((prev) => !prev);
    setIsMobileMenuOpen(false); // PC 메뉴 열릴 때 모바일 메뉴 닫기
  };

  // 메뉴 링크 클릭 시 메뉴 닫기 (모바일용)
  const handleLinkClick = () => {
    setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 100);
  };

  return (
    <header className="main-header">
      <div className="header-inner">
        {/* 1. 왼쪽 햄버거 버튼 (모바일 전용) */}
        <div className="mobile-menu-toggle-left" onClick={handleToggleMenu}>
          {isMobileMenuOpen ? (
            <FaTimes size={24} /> // 닫기 아이콘
          ) : (
            <FaBars size={24} /> // 햄버거 아이콘
          )}
        </div>

        {/* 2. 로고/사이트 이름 */}
        <div className="header-logo">
          <Link to="/" onClick={handleLinkClick}>
            Delicious Eats
          </Link>
        </div>

        {/* 3. PC용 메인 네비게이션 */}
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

        {/* 4. 오른쪽 유틸리티 (PC 로그인/프로필만 남김) */}
        <div className="header-utility">
          {/* PC 로그인/회원가입 버튼 */}
          {!isLoggedIn && (
            <div className="pc-auth-buttons">
              <Link to="/login">
                <button className="utility-btn">로그인</button>
              </Link>
              <Link to="/signup">
                <button className="utility-btn primary">회원가입</button>
              </Link>
            </div>
          )}

          {/*PC 로그인 상태: PC용 프로필 드롭다운 메뉴 */}
          {isLoggedIn && (
            <div className="user-profile-container-pc">
              {" "}
              {/*  PC 전용 컨테이너 */}
              <div className="user-menu-toggle" onClick={handleTogglePcMenu}>
                <span className="user-id-display">{userName} 님</span>
                <FaRegUserCircle className="profile-icon" size={24} />
              </div>
              {/*UserMenu.js 컴포넌트 렌더링 (PC 전용) */}
              {isPcMenuOpen && (
                <UserMenu
                  username={userName}
                  logout={handleLogout}
                  closeMenu={() => setIsPcMenuOpen(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. 통합 모바일 메뉴 패널 (오버레이 포함) - 분리된 컴포넌트 사용 */}
      <MobileMenuPanel
        isMobileMenuOpen={isMobileMenuOpen}
        isLoggedIn={isLoggedIn}
        userName={userName}
        handleLogout={handleLogout}
        handleLinkClick={handleLinkClick}
        handleToggleMenu={handleToggleMenu} // 오버레이 클릭 시 닫기 위해 토글 함수 전달
      />
    </header>
  );
}

export default Header;
