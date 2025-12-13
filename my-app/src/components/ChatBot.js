import React, { useState, useRef, useEffect } from "react";
// 분리된 CSS 파일을 import 합니다.
import "../css/ChatBot.css";

/**
 * 백엔드 스크립트 엔드포인트로 사용자 메시지를 전송하고 Gemini의 답변을 받습니다.
 * @param {string} userMessage 사용자가 입력한 메시지 (선호 음식 정보 등)
 * @returns {Promise<string>} 챗봇의 응답 텍스트 (레시피)
 */
const realChatAPI = async (userMessage) => {
  // 실제 웹 서버에서 Python 스크립트가 실행되는 엔드포인트로 변경하세요.
  // 예: '/cgi-bin/chat_handler.py' 또는 '/api/chatbot/recipe'
  const API_ENDPOINT = "/api/chatbot/recipe";

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // 필요한 경우 인증 토큰을 여기에 추가합니다.
    },
    // 사용자의 메시지를 백엔드에 JSON 형태로 전달
    body: JSON.stringify({ message: userMessage }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    // HTTP 오류 또는 백엔드 스크립트에서 명시적으로 보낸 오류 처리
    const errorMessage = data.error || `서버 오류 발생: ${response.status}`;
    throw new Error(errorMessage);
  }

  // Gemini로부터 받은 최종 레시피 응답 텍스트를 반환
  return data.response;
};

// =========================================================
// 2. React 챗봇 컴포넌트
// =========================================================

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "안녕하세요! 선호하는 요리(예: 매운 맛, 해산물)를 알려주시면 현재 재료로 만들 수 있는 이국적인 레시피를 추천해 드립니다.",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatBoxRef = useRef(null);

  // 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // 메시지 전송 핸들러
  const sendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    setIsLoading(true);
    setInput("");
    const newMessageId = Date.now();

    // 1. 사용자 메시지 추가
    setMessages((prev) => [
      ...prev,
      { id: newMessageId, text: userMessage, sender: "user" },
    ]);

    // 2. 봇 로딩 메시지 추가
    const loadingId = newMessageId + 1;
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        text: "레시피를 생성하는 중...",
        sender: "bot",
        loading: true,
      },
    ]);

    try {
      // 3. 실제 API 호출 (realChatAPI 사용)
      const botResponse = await realChatAPI(userMessage);

      // 4. 로딩 메시지 제거 및 실제 응답 메시지 추가
      setMessages((prev) => {
        const filteredMessages = prev.filter((msg) => msg.id !== loadingId);
        // 줄바꿈이 포함된 텍스트를 그대로 표시
        return [
          ...filteredMessages,
          { id: loadingId, text: botResponse, sender: "bot" },
        ];
      });
    } catch (error) {
      console.error("Chat processing error:", error);
      // 사용자에게 에러 메시지를 표시
      const displayError = error.message.includes("서버 오류")
        ? "죄송합니다. 서버 통신에 문제가 발생했습니다."
        : error.message;

      setMessages((prev) => {
        const filteredMessages = prev.filter((msg) => msg.id !== loadingId);
        return [
          ...filteredMessages,
          {
            id: loadingId,
            text: displayError,
            sender: "bot",
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div ref={chatBoxRef} className="chat-box">
        {messages.map((msg) => (
          <div
            key={msg.id}
            // sender에 따라 클래스 이름 지정 (CSS 파일에 정의됨)
            className={`message ${msg.sender}-message`}
          >
            {/* 줄바꿈을 <br /> 태그로 변환하여 렌더링 */}
            {msg.text.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          className="chat-input"
          placeholder={
            isLoading ? "메시지 전송 대기 중..." : "선호하는 요리를 입력하세요."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button
          className="send-button"
          onClick={sendMessage}
          disabled={isLoading}
        >
          {isLoading ? "전송 중..." : "레시피 추천"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
