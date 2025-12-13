// src/components/AdminPage.js
// 또는 src/pages/AdminPage.js

import React from "react";
import { useAuth } from "../context/AuthContext";
import "../css/Admin.css"; // 새로 생성한 CSS 파일 import

function AdminPage() {
  // AuthContext에서 현재 로그인된 관리자의 정보를 가져옵니다.
  const { userName, userRole } = useAuth();

  // 권한 확인 (AdminRoute에서 처리하지만 안전을 위해 남겨둠)
  if (userRole !== "admin") {
    return (
      <div className="access-denied">
        <h1>🚨 접근 권한 없음</h1>
        <p>이 페이지는 관리자 전용 페이지입니다.</p>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <header className="admin-header">
        <h1>👨‍💼 관리자 대시보드</h1>
        <p>
          환영합니다, **{userName}** 님! 임시로 만든 관리자 페이지입니다! (권한:
          **{userRole}**)
        </p>
      </header>

      <section>
        <h2>📊 주요 통계</h2>
        <div className="card-container">
          <div className="card">
            <h3>오늘의 가입자 수</h3>
            <p className="metric">120명</p>
          </div>
          <div className="card">
            <h3>처리 대기 주문</h3>
            <p className="metric">15건</p>
          </div>
          <div className="card">
            <h3>미승인 게시물</h3>
            <p className="metric">5개</p>
          </div>
        </div>
      </section>

      <section className="admin-management-section">
        <h2>🛠️ 관리 기능</h2>
        <ul className="admin-list">
          <li>사용자 목록 및 권한 관리</li>
          <li>콘텐츠 승인 및 삭제</li>
          <li>시스템 설정 변경</li>
        </ul>
      </section>
    </div>
  );
}

// 인라인 스타일 객체는 더 이상 필요 없으므로 제거됩니다.
// export default AdminPage;
// 또는 export default AdminPage;
export default AdminPage;
