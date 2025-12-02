// src/pages/Signup.js

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 🔑 useAuth 훅 가져오기
import "../css/Form.css";

const REGISTER_API_URL = "http://localhost:60014/api/auth/register";

function Signup() {
  const [userName, setUsername] = useState("");
  const [userId, setId] = useState("");
  const [userPw, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const navigate = useNavigate();
  const { login } = useAuth(); // 🔑 login 함수 가져오기

  const closeModal = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!userName || !userId || !userPw) {
      setError("모든 필드를 입력해주세요.");
      setIsLoading(false);
      return;
    }

    const userData = {
      userId: userId,
      userPw: userPw,
      userName: userName,
    };

    try {
      const response = await fetch(REGISTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // 🚀 서버가 회원가입 성공 후 토큰을 발급해주는 경우 (자동 로그인)
        const { accessToken, refreshToken, user } = data;
        const fetchedUserName = user?.name; // user 객체 안에 name 필드가 있다고 가정

        if (accessToken && refreshToken && fetchedUserName) {
          // Access, Refresh Token, 사용자 이름을 모두 Context에 전달
          login(accessToken, refreshToken, fetchedUserName);

          alert("✅ 회원가입 및 자동 로그인이 완료되었습니다!");
          navigate("/", { replace: true }); // 메인 페이지로 이동
        } else {
          // 서버가 토큰을 발급해주지 않고, 메시지만 반환하는 일반적인 경우
          console.log("회원가입 성공:", data.message);
          alert("✅ 회원가입이 성공적으로 완료되었습니다. 로그인해 주세요.");
          navigate("/login");
        }
      } else {
        // 회원가입 실패 (예: 아이디 중복, 유효성 검사 실패)
        setError(
          data.message || "❌ 회원가입에 실패했습니다. 다시 시도해 주세요."
        );
      }
    } catch (err) {
      setError("❌ 서버 연결 중 오류가 발생했습니다.");
      console.error("회원가입 요청 오류:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      closeModal();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="form-container">
        <button className="close-btn" onClick={closeModal}>
          X
        </button>
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">사용자 이름:</label>
            <input
              type="text"
              id="username"
              value={userName}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="id">아이디:</label>
            <input
              type="text"
              id="id"
              value={userId}
              onChange={(e) => setId(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호:</label>
            <input
              type="password"
              id="password"
              value={userPw}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button
            type="submit"
            className="submit-btn primary"
            disabled={isLoading}
          >
            {isLoading ? "가입 처리 중..." : "회원가입"}
          </button>
        </form>
        <p className="link-text">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
