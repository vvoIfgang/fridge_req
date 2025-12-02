// src/pages/Login2.js
// 이 파일을 Login.js 대신 사용하시거나, 파일명을 Login2.js로 유지하고 라우팅을 수정하세요.

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/Form.css";

// ⚠️ 백엔드 API 엔드포인트 URL 확인 (8080 포트 사용 가정)
const LOGIN_API_URL = "http://localhost:60014/api/auth/login";

function Login() {
  const [userId, setId] = useState("");
  const [userPw, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const navigate = useNavigate();
  // 🔑 useAuth에서 수정된 login 함수 사용
  const { login } = useAuth();

  const closeModal = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId || !userPw) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true); // 로딩 시작

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 백엔드 서버로 userId와 userPw 전송
        body: JSON.stringify({ userId, userPw }),
      });

      const data = await response.json();

      if (response.ok) {
        // 🔑 서버 응답 구조 확인 및 토큰 분리
        const { accessToken, refreshToken, user } = data;
        const userName = user?.name; // user 객체 안에 name 필드가 있다고 가정

        if (accessToken && refreshToken && userName) {
          // 🚀 Access Token, Refresh Token, 사용자 이름을 모두 Context에 전달
          login(accessToken, refreshToken, userName);
          navigate("/", { replace: true });
        } else {
          setError(
            "서버로부터 유효한 토큰, 리프레시 토큰 또는 사용자 정보를 받지 못했습니다."
          );
        }
      } else {
        // 로그인 실패 (401 등)
        setError(
          data.message ||
            "로그인에 실패했습니다. 아이디와 비밀번호를 확인해 주세요."
        );
      }
    } catch (err) {
      // 네트워크 연결 오류
      setError("서버 연결 중 오류가 발생했습니다. (네트워크 상태 확인 필요)");
      console.error("로그인 요청 오류:", err);
    } finally {
      setIsLoading(false); // 로딩 종료
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
        <h2>로그인</h2>
        <form onSubmit={handleSubmit} className="auth-form">
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

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>
        <p className="link-text">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
