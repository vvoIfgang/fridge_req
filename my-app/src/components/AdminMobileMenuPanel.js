import React from "react";
import { Link } from "react-router-dom";
import { FaUserShield } from "react-icons/fa"; // 관리자를 상징하는 아이콘 사용

/**
 * 관리자 모바일 메뉴 패널 컴포넌트 (왼쪽 슬라이드)
 * 이 컴포넌트에 메뉴 패널과 오버레이가 모두 포함됩니다.
 *
 * @param {boolean} isMobileMenuOpen - 메뉴가 열렸는지 여부
 * @param {string} userName - 관리자 사용자 이름 (로그인 상태를 가정)
 * @param {function} handleLogout - 로그아웃 처리 함수
 * @param {function} handleLinkClick - 링크 클릭 시 메뉴 닫기 처리 함수
 * @param {function} handleToggleMenu - 오버레이 클릭 시 메뉴를 닫는 함수
 */
function AdminMobileMenuPanel({
  isMobileMenuOpen,
  userName,
  handleLogout,
  handleLinkClick,
  handleToggleMenu,
}) {
  // 메뉴가 닫혀 있으면 아무것도 렌더링하지 않습니다.
  if (!isMobileMenuOpen) {
    return null;
  }

  // 관리자 메뉴는 기본적으로 로그인이 되어있다고 가정하고 UI를 구성합니다.
  const isAdminLoggedIn = !!userName;

  return (
    <>
      {/* 🟢 1. 오버레이 영역 (뒷 배경 어둡게 처리 및 클릭 시 닫기) */}
      <div className="mobile-menu-overlay" onClick={handleToggleMenu}></div>

      {/* 🟢 2. 메뉴 패널 영역 (왼쪽 슬라이드) */}
      <div className="mobile-integrated-menu open">
        {/* 🔴 A. 관리자 정보 영역 (통합 메뉴 헤더) */}
        <div className="mobile-menu-header admin-header">
          {isAdminLoggedIn ? (
            <>
              <FaUserShield size={30} className="profile-icon-mobile" />
              <span className="user-display-mobile">
                {userName} <span className="admin-label">(관리자)</span>
              </span>
              {/* 기존 User Menu의 레벨 뱃지 역할 */}
              <span className="level-badge-mobile">관리 시스템</span>
            </>
          ) : (
            // 관리자 메뉴는 로그인 상태에서만 표시되지만, 만약을 대비하여 빈 상태 처리
            <p>로그인이 필요합니다.</p>
          )}
        </div>

        {/* 🔴 B. 메인 네비게이션 영역 */}
        <nav className="mobile-main-nav">
          <ul>
            {/* 관리자 전용 메뉴 */}
            {isAdminLoggedIn && (
              <>
                <li>
                  <Link to="/profile" onClick={handleLinkClick}>
                    나의 정보
                  </Link>
                </li>
                <li>
                  <Link to="/admin" onClick={handleLinkClick}>
                    🛠️ 관리자 대시보드
                  </Link>
                </li>
                <hr />
              </>
            )}

            {/* 공통 메뉴 (유저 메뉴의 사이트 메뉴와 동일) */}
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
                받아온 API와 기술
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
        {isAdminLoggedIn && (
          <button className="mobile-logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        )}
      </div>
    </>
  );
}

export default AdminMobileMenuPanel;
