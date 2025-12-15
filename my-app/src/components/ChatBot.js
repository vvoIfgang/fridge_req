// src/components/Chatbot.js (또는 Chatbot 컴포넌트 파일)

import React, { useState, useRef, useEffect } from "react";
import "../css/ChatBot.css";
// ✅ 리팩토링: useApi 훅을 가져옵니다.
import useApi from "../hook/useApi";

// =========================================================
// 1. 챗봇 API 호출 로직 (useApi 훅을 통해 간소화)
// =========================================================

/**
 * 백엔드 스크립트 엔드포인트로 사용자 메시지를 전송하고 Gemini의 답변을 받습니다.
 * @param {Function} apiPost useApi 훅에서 반환된 post 함수
 * @param {string} userMessage 사용자가 입력한 메시지
 * @returns {Promise<string>} 챗봇의 응답 텍스트 (레시피)
 */
const realChatAPI = async (apiPost, userMessage) => {
  // useApi 훅이 Authorization 헤더와 토큰 갱신/재시도를 모두 처리합니다.
  const API_ENDPOINT = "/api/chatbot/recipe";

  // useApi의 post 함수를 사용하여 요청
  const data = await apiPost(API_ENDPOINT, { message: userMessage });

  // 성공 시, Gemini로부터 받은 최종 레시피 응답 텍스트를 반환
  return data.response;
};

// =========================================================
// 2. React 챗봇 컴포넌트
// =========================================================

const Chatbot = () => {
  // ✅ useApi 훅에서 API 메소드를 가져옵니다.
  const api = useApi();

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
      // 3. 실제 API 호출 (useApi의 post 함수를 realChatAPI로 전달)
      const botResponse = await realChatAPI(api.post, userMessage);

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

      // useApi에서 토큰 갱신에 완전히 실패했거나, /login으로 리디렉션된 경우
      // 이 catch 블록은 서버 측 에러나, 토큰 갱신 외의 최종 오류를 처리합니다.
      const displayError = error.message.includes("세션 만료")
        ? "세션이 완전히 만료되어 재로그인이 필요합니다."
        : error.message.includes("요청 실패")
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

