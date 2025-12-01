// src/hooks/useApi.js (새로 만들 파일)

import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:5000"; // 백엔드 서버 URL
const REFRESH_API_URL = `${API_BASE_URL}/api/auth/refresh`; // 백엔드 refresh 엔드포인트

// 💡 전역 변수: 토큰 갱신 요청이 중복되는 것을 막기 위한 플래그
let isRefreshing = false;
// 💡 대기열: 토큰 갱신 중 밀린 요청들을 저장할 배열
let failedQueue = [];

// 💡 큐에 쌓인 요청들을 처리하는 함수
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const useApi = () => {
  const { accessToken, refreshToken, logout, refreshAuthToken } = useAuth();

  // 💡 실제 API 요청을 수행하는 핵심 함수
  const request = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    // 1. 초기 요청 헤더 설정
    const headers = { "Content-Type": "application/json" };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const config = {
      ...options,
      headers: { ...headers, ...options.headers },
    };

    try {
      let response = await fetch(url, config);

      // 2. 401 Unauthorized 에러 발생 시 토큰 갱신 시도
      if (
        response.status === 401 &&
        refreshToken &&
        endpoint !== "/api/auth/login"
      ) {
        // 2-1. 토큰 갱신이 진행 중이라면, 현재 요청을 대기열에 추가하고 대기
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              // 새 토큰으로 헤더를 다시 설정하고 원래 요청 재시도
              config.headers["Authorization"] = `Bearer ${localStorage.getItem(
                "accessToken"
              )}`;
              return fetch(url, config).then((r) => r.json());
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        // 2-2. 토큰 갱신 시작 (딱 한 번만 실행)
        isRefreshing = true;

        // 2-3. Refresh Token으로 새 Access Token 요청
        const refreshResponse = await fetch(REFRESH_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const newAccessToken = data.accessToken;

          // Context와 localStorage 업데이트
          refreshAuthToken(newAccessToken);

          // 대기열 요청 처리 및 플래그 초기화
          isRefreshing = false;
          processQueue(null, newAccessToken);

          // 새 토큰으로 원래 요청 재시도
          config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          response = await fetch(url, config); // ⚠️ 재요청
        } else {
          // Refresh Token도 만료되거나 유효하지 않다면 로그아웃 처리
          isRefreshing = false;
          processQueue(new Error("세션 만료"), null);
          logout();
          // 로그인 페이지로 리디렉션 로직 추가 가능
          throw new Error("세션이 만료되어 로그아웃 되었습니다.");
        }
      }

      // 3. 응답 처리 및 반환
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API 요청 실패: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  };

  // RESTful API 메서드 반환
  return {
    get: (endpoint, options) =>
      request(endpoint, { method: "GET", ...options }),
    post: (endpoint, body, options) =>
      request(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
        ...options,
      }),
    // ... put, del 등 다른 메서드
  };
};

export default useApi;
