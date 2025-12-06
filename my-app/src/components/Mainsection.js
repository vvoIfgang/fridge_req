import React, { useState } from "react";
// 💡 [추가] 페이지 이동을 위해 useNavigate 훅을 가져옵니다.
import { useNavigate } from "react-router-dom";
import "../css/Mainsection.css";

import foodImage1 from "../images/chicken.avif";
import foodImage2 from "../images/stake.avif";
import foodImage3 from "../images/pizza.jpg";
import foodImage4 from "../images/chicken soup.jpg";

// 여러 음식 이미지 배열
const foodImages = [foodImage1, foodImage2, foodImage3, foodImage4];

function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // 💡 [추가] 페이지 이동을 위한 useNavigate 인스턴스
  const navigate = useNavigate();

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

  // 💡 [추가] 사이트 제공 서비스 페이지로 이동하는 함수
  const handleNavigateToService = () => {
    // '/service'는 사이트 제공 서비스 페이지의 경로로 가정합니다.
    navigate("/service");
  };

  // ❌ [제거] 모달 관련 함수 제거
  // const handleSignUpClick = () => { /* ... */ };
  // const handleCloseModal = () => { /* ... */ };

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
          &#10094;
        </button>
        <button className="nav-btn next-btn" onClick={goToNext}>
          &#10095;
        </button>

        {/* 중앙 텍스트 오버레이 */}
        <div className="hero-text-overlay">
          <h1>당신의 레시피</h1>
          <p>당신의 냉장고 속 재료로 만들 수 있는 요리를 만드세요!!</p>
          {/* 💡 [수정] 버튼 클릭 시 페이지 이동 함수 호출 */}
          <button className="view-menu-btn" onClick={handleNavigateToService}>
            지금 바로 하러 가기
          </button>
        </div>
      </div>

      {/* ❌ [제거] 모달 렌더링 코드 제거 */}
      {/* {showSignupModal && (
        <Modal onClose={handleCloseModal}>
          <Signup onClose={handleCloseModal} />
        </Modal>
      )} */}
    </div>
  );
}

export default HeroSection;
