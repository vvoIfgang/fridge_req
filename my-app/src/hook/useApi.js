// src/hooks/useApi.js (수정 완료)

import { useCallback, useMemo, useRef } from "react"; // 1. useRef 추가
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "";
const REFRESH_API_URL = `${API_BASE_URL}/api/auth/refresh`; // 요청하신 대로 유지

const useApi = () => {
  // 1. useRef를 훅 내부로 이동 (각 인스턴스별 독립적인 상태)
  const isRefreshing = useRef(false);
  const failedQueue = useRef([]);

  // 2. processQueue를 훅 내부에서 useCallback으로 정의하고 .current 사용
  const processQueue = useCallback((error, token = null) => {
    failedQueue.current.forEach((prom) => {
      // failedQueue.current 사용
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue.current = []; // failedQueue.current 사용
  }, []); // 의존성 배열 없음: 이 함수 자체는 변하지 않습니다.

  // 4. useAuth 디스트럭처링 수정 (processQueue 제거)
  const { accessToken, refreshToken, logout, refreshAuthToken } = useAuth();

  // 2. request 함수를 useCallback으로 감싸서 재사용
  const request = useCallback(
    async (endpoint, options = {}) => {
      const url = `${API_BASE_URL}${endpoint}`;

      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const config = {
        ...options,
        headers: headers,
      };

      try {
        let response = await fetch(url, config);

        if (
          response.status === 401 &&
          refreshToken &&
          endpoint !== "/api/auth/login"
        ) {
          // 5. isRefreshing.current 사용
          if (isRefreshing.current) {
            return new Promise((resolve, reject) => {
              // 5. failedQueue.current 사용
              failedQueue.current.push({ resolve, reject });
            })
              .then((newToken) => {
                config.headers["Authorization"] = `Bearer ${newToken}`;
                return fetch(url, config).then((r) => r.json());
              })
              .catch((err) => Promise.reject(err));
          }

          // 5. isRefreshing.current 사용
          isRefreshing.current = true;

          try {
            const refreshResponse = await fetch(REFRESH_API_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              const newAccessToken = data.accessToken;

              refreshAuthToken(newAccessToken);
              processQueue(null, newAccessToken);
              // 5. isRefreshing.current 사용
              isRefreshing.current = false;

              config.headers["Authorization"] = `Bearer ${newAccessToken}`;
              response = await fetch(url, config);
            } else {
              throw new Error("세션 만료");
            }
          } catch (err) {
            // 5. isRefreshing.current 사용
            isRefreshing.current = false;
            processQueue(err, null);
            logout();
            window.location.href = "/login";
            return Promise.reject(err);
          }
        }

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
  ); // 의존성 배열에 processQueue 포함

  // 3. 리턴되는 객체를 useMemo로 감싸서 고정시킴
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
