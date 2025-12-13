// src/components/AdminMenu.js
import React from "react";
import { Link } from "react-router-dom";
import "../css/Header.css"; // UserMenu와 동일한 스타일을 사용한다고 가정

function AdminMenu({ username, logout, closeMenu }) {
  // 메뉴 링크 클릭 시 드롭다운을 닫는 함수
  const handleLinkClick = () => {
    setTimeout(closeMenu, 100);
  };

  return (
    <div className="user-dropdown-menu">
      {/* 1. 상단 정보 영역 (아이디 및 레벨) */}
      <div className="menu-header-info">
        <p className="user-display">{username}님의 정보</p>
      </div>

      {/* 2. 메뉴 목록 */}
      <ul className="menu-list">
        <li>
          {/* 🛠️ 수정: '나의 정보'는 보통 프로필 페이지의 시작점입니다. */}
          <Link to="/profile" onClick={handleLinkClick}>
            나의 정보
          </Link>
        </li>
        <li>
          <Link to="/admin" onClick={handleLinkClick}>
            관리자 페이지
          </Link>
        </li>
        <li>
          <Link to="/fridge" onClick={handleLinkClick}>
            나의 냉장고
          </Link>
        </li>
      </ul>

      {/* 3. 로그아웃 버튼 */}
      <button
        onClick={() => {
          logout();
          handleLinkClick();
        }} // 로그아웃 실행 후 메뉴 닫기
        className="logout-btn"
      >
        로그아웃
      </button>
    </div>
  );
}

export default AdminMenu;
