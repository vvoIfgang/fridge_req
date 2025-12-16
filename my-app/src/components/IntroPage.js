import React from "react";
// 💡 [추가] 페이지 이동을 위해 useNavigate 훅을 가져옵니다.
import { useNavigate } from "react-router-dom";
import "../css/IntroPage.css";
import introHeroImageUrl from "../images/intro.jpeg";
// IntroPage의 상단 섹션에 사용할 배경 이미지 URL

function IntroPage() {
  // 💡 [추가] 페이지 이동을 위한 useNavigate 인스턴스
  const navigate = useNavigate();

  // 💡 [추가] 메인 페이지 (루트 경로 '/')로 이동하는 함수
  const handleNavigateToMain = () => {
    navigate("/");
  };

  return (
    <div className="intro-page-layout">
      {/* 1. 메인 화면 MainSection과 유사한 느낌의 상단 섹션 */}
      <section
        className="intro-main-hero"
        style={{ backgroundImage: `url(${introHeroImageUrl})` }}
      >
        <div className="intro-hero-content">
          <p className="intro-sub-heading">Delicious Eats</p>
          <h1>냉장고 재료를 이국적인 요리로</h1>
          <p className="intro-description">
            AI의 특별한 레시피가 냉장고 속 남은 재료로
            <br />
            당신의 식탁을 더욱 풍요롭게 만들어 드립니다.
          </p>
        </div>
      </section>

      {/* 2. 회사 철학 / 비전 섹션 */}
      <section className="intro-vision-section">
        <div className="vision-content">
          <h2>우리의 서비스 이념</h2>
          <p>
            Delicious Eats는 사용자들에게 세계의 다양한 이국적인 음식들을
            알려주는 것을 목적으로 합니다.
            <br />
            냉장고 속 재료와 난생 처음 보는 이국적인 음식들를 통해, 모든
            사용자들이 냉장고 속 재료를 비우고 특별한 식사 경험을 할 수 있게
            선사하는 것이 우리의 최우선 목표입니다.
          </p>
          <hr className="vision-divider" />
        </div>
      </section>

      {/* 3. 핵심 가치 (3~4개 아이콘/텍스트 조합) */}
      <section className="intro-values-section">
        <div className="values-overlay">
          <h2>Delicious Eats의 핵심 가치</h2>
          <div className="value-items">
            <div className="value-item">
              <h3>색다른 레시피</h3>
              <p>AI가 사용자의 선호에 맞는 이국적인 레시피를 제안합니다.</p>
            </div>
            <div className="value-item">
              <h3>재료의 관리</h3>
              <p>냉장고 속 재료를 바탕으로 레시피를 제공합니다.</p>
            </div>
            <div className="value-item">
              <h3>편리한 접근성</h3>
              <p>언제 어디서든 쉽고 빠르게 요리 정보를 얻을 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 클로징 / 콜투액션 (선택 사항) */}
      <section className="intro-cta-section">
        <p>
          지금 바로 Delicious Eats와 함께 새로운 미식의 여정을 시작해보세요!
        </p>
        {/* 💡 [수정] 버튼 클릭 시 메인 페이지 이동 함수 호출 */}
        <button className="intro-cta-btn" onClick={handleNavigateToMain}>
          메인 페이지로 돌아가기
        </button>
      </section>
    </div>
  );
}

export default IntroPage;
