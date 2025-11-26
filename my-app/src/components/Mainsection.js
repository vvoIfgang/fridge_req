// src/components/HeroSection.js
import React, { useState } from "react";
import "../css/Mainsection.css"; // HeroSection 전용 CSS 파일

import foodImage1 from "../images/chicken.avif";
import foodImage2 from "../images/stake.avif";
import foodImage3 from "../images/pizza.jpg";
import foodImage4 from "../images/chicken soup.jpg";

// 여러 음식 이미지 배열
const foodImages = [foodImage1, foodImage2, foodImage3, foodImage4];

function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstImage = currentImageIndex === 0;
    const newIndex = isFirstImage
      ? foodImages.length - 1
      : currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
  };

  const goToNext = () => {
    const isLastImage = currentImageIndex === foodImages.length - 1;
    const newIndex = isLastImage ? 0 : currentImageIndex + 1;
    setCurrentImageIndex(newIndex);
  };

  return (
    <div className="hero-container">
      <div className="hero-image-wrapper">
        <img
          src={foodImages[currentImageIndex]}
          alt="오늘의 특별한 음식"
          className="hero-image"
        />

        {/* 이전/다음 버튼 */}
        <button className="nav-btn prev-btn" onClick={goToPrevious}>
          &#10094; {/* 유니코드 왼쪽 화살표 */}
        </button>
        <button className="nav-btn next-btn" onClick={goToNext}>
          &#10095; {/* 유니코드 오른쪽 화살표 */}
        </button>

        {/* 중앙 텍스트 오버레이 */}
        <div className="hero-text-overlay">
          <h1>당신의 레시피</h1>
          <p>당신의 냉장고 속 재료로 만들 수 있는 요리를 만드세요!!</p>
          <button className="view-menu-btn">지금 바로 하러 가기</button>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
