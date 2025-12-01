// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/Form.css";

function Login() {
  // 🛠️ 수정: email 대신 id 상태 변수 사용
  const [userId, setId] = useState("");
  const [userPw, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const closeModal = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 🛠️ 수정: 백엔드로 { id, password } 전송
        body: JSON.stringify({ userId, userPw }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.accessToken && data.userName) {
          login(data.accessToken, data.userName);
          navigate("/");
        } else {
          setError(
            "서버로부터 유효한 토큰 또는 사용자 정보를 받지 못했습니다."
          );
        }
      } else {
        setError(
          data.message ||
            "로그인에 실패했습니다. 아이디와 비밀번호를 확인해 주세요."
        );
      }
    } catch (err) {
      setError("서버 연결 중 오류가 발생했습니다.");
      console.error("로그인 요청 오류:", err);
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
            <label htmlFor="id">아이디:</label> {/* 🛠️ 수정: htmlFor="id" */}
            <input
              type="text"
              id="id" // 🛠️ 수정: id="id"
              value={userId}
              onChange={(e) => setId(e.target.value)}
              required
            />
            {/* 🛠️ 수정: setId 사용 */}
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호:</label>
            <input
              type="password"
              id="password"
              value={userPw}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="submit-btn">
            로그인
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
