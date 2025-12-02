// src/hooks/useApi.js

import { useCallback, useMemo } from "react"; // 1. useCallback, useMemo 추가
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const REFRESH_API_URL = `${API_BASE_URL}/api/auth/refresh`;

let isRefreshing = false;
let failedQueue = [];

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
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((newToken) => {
                config.headers["Authorization"] = `Bearer ${newToken}`;
                return fetch(url, config).then((r) => r.json());
              })
              .catch((err) => Promise.reject(err));
          }

          isRefreshing = true;

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
              isRefreshing = false;

              config.headers["Authorization"] = `Bearer ${newAccessToken}`;
              response = await fetch(url, config);
            } else {
              throw new Error("세션 만료");
            }
          } catch (err) {
            isRefreshing = false;
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
    [accessToken, refreshToken, logout, refreshAuthToken]
  ); // 의존성 배열 추가

  // 3. 리턴되는 객체를 useMemo로 감싸서 고정시킴 (핵심!)
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
