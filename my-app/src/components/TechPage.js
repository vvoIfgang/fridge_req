import React from "react";
// 💡 [추가] 페이지 이동을 위해 useNavigate 훅을 가져옵니다.
import { useNavigate } from "react-router-dom";
import "../css/TechPage.css";
// 기술 페이지 상단 배너에 사용할 배경 이미지 URL (실제 경로로 교체 필요)
import techHeroImageUrl from "../images/tech.jpeg";

function TechPage() {
  // 💡 [추가] 페이지 이동을 위한 useNavigate 인스턴스
  const navigate = useNavigate();

  // 💡 [추가] 메인 페이지 (루트 경로 '/')로 이동하는 함수
  const handleNavigateToMain = () => {
    navigate("/");
  };

  return (
    <div className="tech-page-layout">
      {/* 1. 상단 배너 섹션 (어두운 배경) */}
      <section
        className="tech-main-hero"
        style={{ backgroundImage: `url(${techHeroImageUrl})` }}
      >
        <div className="tech-hero-content">
          <p className="tech-sub-heading">TECHNOLOGY STACK</p>
          <h1>Delicious Eats 구현 기술</h1>
          <p className="tech-description">
            최첨단 API 및 프레임워크를 활용하여 혁신적인 레시피 서비스를
            제공합니다.
          </p>
        </div>
      </section>

      {/* 2. 핵심 API 및 데이터베이스 섹션 (흰색 배경) */}
      <section className="tech-section api-section">
        <h2 className="section-title">핵심 API 및 데이터 엔진</h2>
        <div className="tech-items-container">
          <div className="tech-item-card">
            <h3 className="item-title">레시피 데이터 API</h3>
            <p className="item-description">
              Recipe API를 통해 전 세계 수만 개의 공식 레시피 데이터를
              실시간으로 수집하고 분류합니다. 이 데이터를 기반으로 다양한 요리
              조건에 맞는 정확한 검색 결과를 제공합니다.
            </p>
            <ul className="api-list">
              <li>주요 역할: 데이터 수집, 정제, 메타데이터 관리</li>
            </ul>
          </div>
          <div className="tech-item-card">
            <h3 className="item-title">식재료 데이터베이스</h3>
            <p className="item-description">
              Ingredient Database를 활용하여 재료의 영양 정보, 유통기한, 대체
              가능 재료 등을 통합 관리합니다. 이는 AI 기반의 냉장고 관리 및
              추천의 핵심 엔진입니다.
            </p>
            <ul className="api-list">
              <li>주요 역할: 재료 속성 관리, 영양 분석 지원</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. 프론트엔드 및 백엔드 스택 섹션 (어두운 배경) */}
      <section className="tech-section stack-section">
        <h2 className="section-title">프론트엔드 및 인프라 스택</h2>
        <div className="stack-details-container">
          <div className="stack-group frontend-group">
            <h3>Frontend</h3>
            <p>
              React를 기반으로 SPA(Single Page Application)를 구축하여 빠르고
              반응성이 뛰어난 사용자 경험(UX)을 제공합니다.
            </p>
            <span className="tech-tag">React</span>
            <span className="tech-tag">JavaScript/TypeScript</span>
            <span className="tech-tag">HTML5/CSS3</span>
          </div>
          <div className="stack-group backend-group">
            <h3>Backend & DB</h3>
            <p>
              안정적인 서버 환경을 위해 Node.js(Express)를 사용하고, 데이터
              유연성을 위해 MariaDB를 채택했습니다.
            </p>
            <span className="tech-tag">Node.js</span>
            <span className="tech-tag">Express</span>
            {/* 💡 [수정] MongoDB -> MariaDB */}
            <span className="tech-tag">MariaDB</span>
            <span className="tech-tag">Cloud Hosting</span>
          </div>
        </div>
      </section>

      {/* 4. 클로징 / 콜투액션 */}
      <section className="tech-cta-section">
        <p>Delicious Eats의 기술적 배경입니다.</p>
        {/* 💡 [수정] 버튼 클릭 시 메인 페이지 이동 함수 호출 */}
        <button className="tech-cta-btn" onClick={handleNavigateToMain}>
          메인 페이지로 돌아가기
        </button>
      </section>
    </div>
  );
}

export default TechPage;
