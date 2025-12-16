import React from "react";
import "../css/Admin.css"; // 필요 시 CSS 파일 경로를 지정하세요.

// ================================================================
// 1. 관리자 수칙 데이터 정의
// ================================================================

/**
 * @typedef {Object} AdminRule
 * @property {number} id - 수칙의 고유 ID
 * @property {string} title - 수칙의 제목
 * @property {string[]} points - 세부 지침 항목 목록
 */

/**
 * 웹 관리자 페이지 운영 및 데이터 관리 수칙
 * @type {AdminRule[]}
 */
const adminRules = [
  {
    id: 1,
    title: "데이터 보안 및 접근 통제",
    points: [
      "관리자 계정의 비밀번호는 강력하고 주기적으로 변경해야 합니다.",
      "민감한 사용자 데이터(개인 정보 등)는 열람 목적 외에 절대로 외부에 유출하거나 공유해서는 안 됩니다.",
      "작업 완료 후에는 반드시 로그아웃하여 세션을 종료해야 합니다.",
      "개인 기기나 공용 네트워크에서의 관리자 페이지 접속을 최소화하고, 가능하다면 지정된 환경에서만 접속합니다.",
    ],
  },
  {
    id: 2,
    title: "계정 관리",
    points: [
      "3개월 이상 미접속시 해당 계정은 개인정보 보호를 위해 삭제됩니다.",
    ],
  },
];

// ================================================================
// 2. React 컴포넌트 정의 및 렌더링
// ================================================================

/**
 * 관리자 수칙을 화면에 표시하는 React 컴포넌트
 */
const AdminRulesDisplay = () => {
  return (
    <div className="admin-rules-container">
      <h1 className="admin-rules-header">관리자 운영 수칙 및 가이드라인</h1>
      <p className="admin-rules-description">
        본 수칙은 서비스의 안정적인 운영과 사용자 데이터 보호를 위한 필수 준수
        사항입니다.
      </p>

      {adminRules.map((rule) => (
        <section key={rule.id} className="rule-section">
          <h2 className="rule-title">
            <span className="rule-id">{rule.id}.</span> {rule.title}
          </h2>
          <ul className="rule-points">
            {rule.points.map((point, index) => (
              <li key={index} className="rule-point-item">
                {point}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default AdminRulesDisplay;
