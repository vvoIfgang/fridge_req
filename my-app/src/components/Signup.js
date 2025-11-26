// src/pages/Signup.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Form.css";

function Signup() {
  const [username, setUsername] = useState("");
  // 🛠️ 수정: email 대신 id 상태 변수 사용
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const closeModal = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 🛠️ 수정: 백엔드로 { username, id, password } 전송
        body: JSON.stringify({ username, id, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("회원가입 성공:", data.message);
        alert("회원가입이 성공적으로 완료되었습니다. 로그인해 주세요.");
        navigate("/login");
      } else {
        setError(
          data.message || "회원가입에 실패했습니다. 다시 시도해 주세요."
        );
      }
    } catch (err) {
      setError("서버 연결 중 오류가 발생했습니다.");
      console.error("회원가입 요청 오류:", err);
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            {/* 🛠️ 수정: 레이블을 '아이디'로, htmlFor="id"로 변경 */}
            <label htmlFor="id">아이디:</label>
            <input
              type="text"
              id="id" // 🛠️ 수정: id="id"
              value={id}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="submit-btn primary">
            회원가입
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
