// src/components/Header.js

import React, { useState } from "react";
import "../css/Header.css";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaRegUserCircle, FaBars, FaTimes } from "react-icons/fa";

// 컴포넌트 임포트
import UserMenu from "./UserMenu";
import AdminMenu from "./AdminMenu";
import MobileMenuPanel from "./MobileMenuPanel"; // 일반 사용자 모바일 메뉴
import AdminMobileMenuPanel from "./AdminMobileMenuPanel"; // 관리자 모바일 메뉴 임포트

function Header() {
  const { isLoggedIn, logout, userName, userRole } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPcMenuOpen, setIsPcMenuOpen] = useState(false);

  const isAdmin = userRole === "admin";

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsPcMenuOpen(false); // PC 메뉴도 닫기
    window.location.href = "/";
  };

  const handleToggleMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setIsPcMenuOpen(false); // 모바일 메뉴 열릴 때 PC 메뉴 닫기
  };

  const handleTogglePcMenu = () => {
    setIsPcMenuOpen((prev) => !prev);
    setIsMobileMenuOpen(false); // PC 메뉴 열릴 때 모바일 메뉴 닫기
  };

  const handleLinkClick = () => {
    // Link 클릭 시 100ms 후 메뉴를 닫습니다.
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsPcMenuOpen(false); // PC 메뉴도 닫기
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
            {/* 관리자 전용 링크 추가 (isAdmin일 경우만) */}
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  style={{ color: "red", fontWeight: "bold" }}
                  onClick={handleLinkClick}
                >
                  관리자 대시보드
                </Link>
              </li>
            )}
            <li>
              <Link to="/intro" onClick={handleLinkClick}>
                사이트 소개
              </Link>
            </li>
            <li>
              <Link to="/service" onClick={handleLinkClick}>
                사이트 제공 서비스
              </Link>
            </li>
            <li>
              <Link to="/tech" onClick={handleLinkClick}>
                받아온 api와 기술
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={handleLinkClick}>
                개발진 소개
              </Link>
            </li>
          </ul>
        </nav>

        {/* 4. 오른쪽 유틸리티 (PC 로그인/프로필) */}
        <div className="header-utility">
          {/* PC 로그인/회원가입 버튼 */}
          {!isLoggedIn && (
            <div className="pc-auth-buttons">
              <Link to="/login" onClick={handleLinkClick}>
                <button className="utility-btn">로그인</button>
              </Link>
              <Link to="/signup" onClick={handleLinkClick}>
                <button className="utility-btn primary">회원가입</button>
              </Link>
            </div>
          )}
          {/* PC 로그인 상태: PC용 프로필 드롭다운 메뉴 */}
          {isLoggedIn && (
            <div className="user-profile-container-pc">
              <div className="user-menu-toggle" onClick={handleTogglePcMenu}>
                <span className="user-id-display">
                  {userName} 님
                  {isAdmin && (
                    <span style={{ color: "red", marginLeft: "5px" }}></span>
                  )}
                </span>
                <FaRegUserCircle className="profile-icon" size={24} />
              </div>
              {/* PC 메뉴: 관리자/일반 사용자 분기 */}
              {isPcMenuOpen &&
                (isAdmin ? (
                  // 관리자인 경우 AdminMenu 렌더링
                  <AdminMenu
                    username={userName}
                    logout={handleLogout}
                    closeMenu={() => setIsPcMenuOpen(false)}
                  />
                ) : (
                  // 일반 사용자인 경우 UserMenu 렌더링
                  <UserMenu
                    username={userName}
                    logout={handleLogout}
                    closeMenu={() => setIsPcMenuOpen(false)}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. 통합 모바일 메뉴 패널 (오버레이 포함) - 관리자/일반 사용자 분기 */}
      {isAdmin ? (
        // 관리자인 경우 AdminMobileMenuPanel 렌더링
        <AdminMobileMenuPanel
          isMobileMenuOpen={isMobileMenuOpen}
          userName={userName}
          handleLogout={handleLogout}
          handleLinkClick={handleLinkClick}
          handleToggleMenu={handleToggleMenu}
        />
      ) : (
        // 일반 사용자이거나 로그아웃 상태인 경우 MobileMenuPanel 렌더링
        <MobileMenuPanel
          isMobileMenuOpen={isMobileMenuOpen}
          isLoggedIn={isLoggedIn}
          userName={userName}
          handleLogout={handleLogout}
          handleLinkClick={handleLinkClick}
          handleToggleMenu={handleToggleMenu}
        />
      )}
    </header>
  );
}

export default Header;
