import React from "react";
import { Link } from "react-router-dom";
import { FaRegUserCircle } from "react-icons/fa";

/**
 * 모바일 메뉴 패널 컴포넌트 (왼쪽 슬라이드)
 * 이 컴포넌트에 메뉴 패널과 오버레이가 모두 포함됩니다.
 *
 * @param {boolean} isMobileMenuOpen - 메뉴가 열렸는지 여부
 * @param {boolean} isLoggedIn - 로그인 상태
 * @param {string} userName - 사용자 이름
 * @param {function} handleLogout - 로그아웃 처리 함수
 * @param {function} handleLinkClick - 링크 클릭 시 메뉴 닫기 처리 함수
 * @param {function} handleToggleMenu - 오버레이 클릭 시 메뉴를 닫는 함수
 */
function MobileMenuPanel({
  isMobileMenuOpen,
  isLoggedIn,
  userName,
  handleLogout,
  handleLinkClick,
  handleToggleMenu, // Header.js에서 전달받은 토글 함수
}) {
  // 메뉴가 닫혀 있으면 아무것도 렌더링하지 않습니다.
  if (!isMobileMenuOpen) {
    return null;
  }

  return (
    <>
      {/* 🟢 1. 오버레이 영역 (뒷 배경 어둡게 처리 및 클릭 시 닫기) */}
      <div className="mobile-menu-overlay" onClick={handleToggleMenu}></div>

      {/* 🟢 2. 메뉴 패널 영역 (왼쪽 슬라이드) */}
      <div className="mobile-integrated-menu open">
        {/* 🔴 A. 로그인/사용자 정보 영역 (통합 메뉴 헤더) */}
        <div className="mobile-menu-header">
          {isLoggedIn ? (
            <>
              <FaRegUserCircle size={30} className="profile-icon-mobile" />
              <span className="user-display-mobile">{userName} 님</span>
              <span className="level-badge-mobile">관리자님의 정보</span>
            </>
          ) : (
            <div className="mobile-auth-links">
              <Link to="/login" onClick={handleLinkClick}>
                로그인
              </Link>
              <Link to="/signup" onClick={handleLinkClick}>
                회원가입
              </Link>
            </div>
          )}
        </div>

        {/* 🔴 B. 메인 네비게이션 영역 */}
        <nav className="mobile-main-nav">
          <ul>
            {isLoggedIn && (
              <>
                <li>
                  <Link to="/profile" onClick={handleLinkClick}>
                    나의 정보
                  </Link>
                </li>
                <li>
                  <Link to="/fridge" onClick={handleLinkClick}>
                    나의 냉장고
                  </Link>
                </li>
                <li>
                  <Link to="/chatbot" onClick={handleLinkClick}>
                    챗봇
                  </Link>
                </li>
                <li>
                  <Link to="/myrecipes" onClick={handleLinkClick}>
                    나의 레시피
                  </Link>
                </li>
                <li>
                  <Link to="/prefer-recipes" onClick={handleLinkClick}>
                    나의 선호 레시피
                  </Link>
                </li>
                <hr />
              </>
            )}
            {/* 사이트 메뉴 */}
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

        {/* 🔴 C. 로그아웃 버튼 */}
        {isLoggedIn && (
          <button className="mobile-logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        )}
      </div>
    </>
  );
}

export default MobileMenuPanel;
