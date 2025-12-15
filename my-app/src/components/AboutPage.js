import React from "react";
// 💡 [추가] 페이지 이동을 위해 useNavigate 훅을 가져옵니다.
import { useNavigate } from "react-router-dom";
import "../css/AboutPage.css";

import developerHeroImageUrl from "../images/About.jpg";
import koProfile from "../images/ko.jpg"; // 고석현 프로필
import kimProfile from "../images/kim.jpg"; // 김주영 프로필
import LiProfile from "../images/Li.png"; // 이정민 프로필

// 팀원 데이터
const teamMembers = [
  {
    name: "고석현",
    role: "Project Lead & Frontend Developer",
    description:
      "사용자 경험(UX) 설계와 핵심 프론트엔드 기능을 담당했습니다. Delicious Eats의 비전을 현실로 만들었습니다.",
    profileImage: koProfile,
  },
  {
    name: "이정민",
    role: "Backend & API Specialist",
    description:
      "안정적인 Recipe API 연동과 서버 인프라 구축을 맡았습니다. 데이터 흐름의 핵심입니다.",
    profileImage: LiProfile,
  },
  {
    name: "김주영",
    role: "AI/ML & Data Analyst",
    description:
      "냉장고 속 재료 기반 AI 추천 알고리즘을 개발했습니다. 개인화된 레시피 추천을 구현했습니다.",
    profileImage: kimProfile,
  },
];

function AboutPage() {
  // 💡 [추가] 페이지 이동을 위한 useNavigate 인스턴스
  const navigate = useNavigate();

  // 💡 [추가] 메인 페이지 (루트 경로 '/')로 이동하는 함수
  const handleNavigateToMain = () => {
    navigate("/");
  };

  return (
    <div className="about-page-layout">
      {/* 1. 상단 배너 섹션 (IntroPage와 동일한 스타일) */}
      <section
        className="about-main-hero"
        style={{ backgroundImage: `url(${developerHeroImageUrl})` }}
      >
        <div className="about-hero-content">
          <p className="about-sub-heading">OUR TEAM</p>
          <h1>Delicious Eats 개발진 소개</h1>
          <p className="about-description">
            최고의 레시피 서비스를 제공하기 위해
            <br />
            아이디어를 현실로 만들어가는 저희 팀을 만나보세요.
          </p>
        </div>
      </section>

      {/* 2. 개발진 상세 소개 카드 섹션 (흰색 배경) */}
      <section className="developer-detail-section">
        <h2 className="developer-section-title">전문성을 갖춘 팀원들</h2>
        <p className="developer-section-description">
          각자의 분야에서 최고의 역량을 가진 팀원들이 긴밀하게 협력하여
          프로젝트를 이끌고 있습니다.
        </p>

        <div className="team-members-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="member-card">
              <div className="member-image-placeholder">
                <img
                  src={member.profileImage}
                  alt={member.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <h3 className="member-name">{member.name}</h3>
              <p className="member-role">{member.role}</p>
              <p className="member-description">{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 클로징 / 콜투액션 섹션 */}
      <section className="about-cta-section">
        <p>Delicious Eats의 비전은 저희 팀의 열정과 노력으로 현실이 됩니다.</p>
        {/* 💡 [수정] 버튼 클릭 시 메인 페이지 이동 함수 호출 */}
        <button className="about-cta-btn" onClick={handleNavigateToMain}>
          메인 페이지로 돌아가기
        </button>
      </section>
    </div>
  );
}

export default AboutPage;


