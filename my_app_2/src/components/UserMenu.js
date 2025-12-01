// src/components/UserMenu.js

import React from "react";
import { Link } from "react-router-dom";
import "../css/Header.css"; // Header.css에 드롭다운 메뉴 스타일을 추가한다고 가정

const UserMenu = ({ username, logout, closeMenu }) => {
  // 실제 레벨 정보는 API에서 가져오겠지만, 여기서는 임시 값 사용

  const handleMenuClick = () => {
    // 메뉴 항목을 클릭할 때 메뉴를 닫습니다.
    closeMenu();
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
          <Link to="/profile" onClick={handleMenuClick}>
            나의 정보
          </Link>
        </li>
        <li>
          <Link to="/fridge" onClick={handleMenuClick}>
            나의 냉장고
          </Link>
        </li>
        <li>
          <Link to="/mypage/my-recipes" onClick={handleMenuClick}>
            나의 레시피
          </Link>
        </li>
        <li>
          <Link to="/mypage/preferred-recipes" onClick={handleMenuClick}>
            나의 선호 레시피
          </Link>
        </li>
        <li>
          <Link to="/mypage/recipe-history" onClick={handleMenuClick}>
            레시피 기록
          </Link>
        </li>
        <li>
          <Link to="/mypage/ai-chef" onClick={handleMenuClick}>
            AI 요리사
          </Link>
        </li>
      </ul>

      {/* 3. 로그아웃 버튼 */}
      <button
        onClick={() => {
          logout();
          handleMenuClick();
        }} // 로그아웃 실행 후 메뉴 닫기
        className="logout-btn"
      >
        로그아웃
      </button>
    </div>
  );
};

export default UserMenu;
