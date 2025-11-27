import React from "react";
// 페이지 이동을 위해 useNavigate 훅을 가져옵니다.
import { useNavigate } from "react-router-dom";
import "../css/ServicePage.css";
// 상단 배너에 사용할 배경 이미지 URL
import serviceHeroImageUrl from "../images/service.jpg";
// 💡 각 기능 섹션의 배경 이미지 경로 (실제 경로로 교체 필요)
import featureRecipeBackground from "../images/recipe.avif";
import featureNutritionBackground from "../images/nutrition.jpg";
import featureGeminiBackground from "../images/Gemini.webp";

function ServicePage() {
  // 페이지 이동을 위한 useNavigate 인스턴스
  const navigate = useNavigate();

  // 메인 페이지 (루트 경로 '/')로 이동하는 함수
  const handleNavigateToMain = () => {
    navigate("/");
  };

  // 💡 여기에 배경 이미지 URL을 배열로 정리합니다.
  const featureBackgrounds = [
    featureRecipeBackground,
    featureNutritionBackground,
    featureGeminiBackground,
  ];

  const serviceFeatures = [
    {
      title: "오늘의 요리",
      subtitle: "사용자의 재료를 반영한 요리 추천",
      description:
        "AI가 당신의 냉장고 속 재료를 분석하여, 적합한 요리를 제안합니다.",
      class: "feature-honest", // 정직 스타일
      imageUrl: featureBackgrounds[0], // 💡 첫 번째 이미지 할당
    },
    {
      title: "영양분 체크",
      subtitle: "요리 레시피에 따라 영양분을 계산",
      description:
        "냉장고 속 재료로 출력된 레시피에 따라 해당 레시피의 영양분을 계산해 드립니다.",
      class: "feature-fair", // 공정 스타일
      imageUrl: featureBackgrounds[1], // 💡 두 번째 이미지 할당
    },
    {
      title: "색다른 레시피",
      subtitle: "AI를 통해 완전히 새로운 레시피를 생성",
      description: "Gemini API를 통해 처음 보는 레시피를 생성해 드립니다.",
      class: "feature-skill", // 실력 스타일
      imageUrl: featureBackgrounds[2], // 💡 세 번째 이미지 할당
    },
  ];

  return (
    <div className="service-page-layout">
      {/* 1. 상단 배너 섹션 (IntroPage의 hero-section 스타일 유지) */}
      <section
        className="service-main-hero"
        style={{ backgroundImage: `url(${serviceHeroImageUrl})` }}
      >
        <div className="service-hero-content">
          <p className="service-sub-heading">Delicious Eats</p>
          <h1>사이트 제공 서비스</h1>
          <p className="service-description">
            당신의 요리 생활을 혁신적으로 변화시킬 핵심 기능들을 소개합니다.
          </p>
        </div>
      </section>
      ---
      {/* 2. 서비스 기능 밴드 섹션 (LG Way 스타일) */}
      <section className="service-bands-wrapper">
        <h2 className="bands-title">Delicious Eats 서비스 행동 방식</h2>
        <p className="bands-subtitle">
          사용자의 식탁을 풍요롭게 하는 핵심 가치를 기반으로 운영됩니다.
        </p>

        {serviceFeatures.map((feature, index) => (
          <div
            key={index}
            className={`feature-band-item ${feature.class}`}
            // 💡 serviceFeatures 배열 내의 imageUrl을 사용하도록 수정
            style={{
              backgroundImage: `url(${feature.imageUrl})`,
            }}
          >
            <div className="band-overlay">
              <h3 className="band-title">{feature.title}</h3>
              <p className="band-subtitle-text">{feature.subtitle}</p>
              <div className="band-detail">
                <p>{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </section>
      ---
      {/* 3. 클로징 / 콜투액션 */}
      <section className="service-cta-section">
        <p>지금 바로 나만의 맞춤형 서비스를 경험해보세요!</p>
        <button className="service-cta-btn" onClick={handleNavigateToMain}>
          메인 페이지로 돌아가기
        </button>
      </section>
    </div>
  );
}

export default ServicePage;
