// src/hooks/useApi.js

import { useCallback, useMemo, useRef } from "react";
import { useAuth } from "../context/AuthContext";

// 실제 백엔드 서버 URL로 설정해야 합니다.
const API_BASE_URL = "";
const REFRESH_API_URL = `${API_BASE_URL}/api/auth/refresh`;

const useApi = () => {
  // useRef를 사용하여 훅 인스턴스별로 독립적인 상태를 관리합니다.
  const isRefreshing = useRef(false);
  const failedQueue = useRef([]); // 큐에 쌓인 요청들을 처리하는 함수 (useCallback으로 최적화)

  const processQueue = useCallback((error, token = null) => {
    failedQueue.current.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue.current = [];
  }, []); // useAuth로부터 인증 관련 상태 및 함수를 가져옵니다.

  const { accessToken, refreshToken, logout, refreshAuthToken } = useAuth(); // 실제 API 요청을 수행하는 핵심 함수 (useCallback으로 최적화)

  const request = useCallback(
    async (endpoint, options = {}) => {
      const url = `${API_BASE_URL}${endpoint}`;

      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      }; // Access Token이 있을 경우 Authorization 헤더 추가 (role과 무관)

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const config = {
        ...options,
        headers: headers,
      };

      try {
        let response = await fetch(url, config); // 401 Unauthorized 에러 발생 시 토큰 갱신 시도

        if (
          response.status === 401 &&
          refreshToken &&
          endpoint !== "/api/auth/login"
        ) {
          // 갱신 중이라면 대기열에 추가
          if (isRefreshing.current) {
            return new Promise((resolve, reject) => {
              failedQueue.current.push({ resolve, reject });
            })
              .then((newToken) => {
                config.headers["Authorization"] = `Bearer ${newToken}`;
                return fetch(url, config).then((r) => r.json());
              })
              .catch((err) => Promise.reject(err));
          } // 토큰 갱신 시작 (딱 한 번)

          isRefreshing.current = true;

          try {
            const refreshResponse = await fetch(REFRESH_API_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              const newAccessToken = data.accessToken; // Context 업데이트

              refreshAuthToken(newAccessToken);
              processQueue(null, newAccessToken);
              isRefreshing.current = false; // 새 토큰으로 원래 요청 재시도

              config.headers["Authorization"] = `Bearer ${newAccessToken}`;
              response = await fetch(url, config);
            } else {
              // Refresh Token 만료 시
              throw new Error("세션 만료");
            }
          } catch (err) {
            // 갱신 실패 시 처리
            isRefreshing.current = false;
            processQueue(err, null);
            logout();
            window.location.href = "/login"; // 로그인 페이지로 리디렉션
            return Promise.reject(err);
          }
        } // 4. 성공 및 일반 에러 처리

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `요청 실패: ${response.status}`);
        }

        return response.json();
      } catch (error) {
        throw error;
      }
    },
    [accessToken, refreshToken, logout, refreshAuthToken, processQueue]
  ); // RESTful API 메서드를 useMemo로 감싸서 반환 (재요청 방지)

  return useMemo(
    () => ({
      get: (endpoint, options) =>
        request(endpoint, { method: "GET", ...options }),
      post: (endpoint, body, options) =>
        request(endpoint, {
          method: "POST",
          body: JSON.stringify(body),
          ...options,
        }),
      put: (endpoint, body, options) =>
        request(endpoint, {
          method: "PUT",
          body: JSON.stringify(body),
          ...options,
        }),
      delete: (endpoint, options) =>
        request(endpoint, { method: "DELETE", ...options }),
    }),
    [request]
  );
};

export default useApi;
