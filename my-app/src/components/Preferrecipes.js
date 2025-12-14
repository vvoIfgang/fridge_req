// src/components/Preferrecipes.js

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hook/useApi";
import "../css/Myfridge.css";
import "../css/Myrecipes.css"; // 레시피 전용 CSS 사용

function Preferrecipes() {
  const { userName: loginId } = useAuth();
  const api = useApi();

  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 1. ⚙️ 선호 레시피 목록 조회 로직 (GET)
  const fetchFavorites = useCallback(async () => {
    if (!loginId) {
      setIsLoading(false);
      setMessage("로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);
    setMessage("선호 레시피 목록을 불러오는 중...");

    try {
      // 🚨 /api/recipes/favorites 엔드포인트 가정
      const response = await api.get(`/api/recipes/favorites`);

      const data = Array.isArray(response)
        ? response
        : response.favorites || [];

      setFavoriteRecipes(data);
      setMessage(`✅ ${data.length}개의 선호 레시피를 불러왔습니다.`);
    } catch (error) {
      console.error("Fetch Favorites Error:", error);
      setMessage(`❌ 선호 레시피 불러오기 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }, [loginId, api]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const getMessageType = (msg) => {
    if (msg.startsWith("✅")) return "success";
    if (msg.startsWith("❌")) return "error";
    return "info";
  };

  if (isLoading) {
    return (
      <div className="profile-loading">선호 레시피 목록을 불러오는 중...</div>
    );
  }

  return (
    <div className="profile-page-container">
      <h2>내 선호 레시피 목록</h2>
      {message && (
        <p className={`status-message ${getMessageType(message)}`}>
          {message.replace(/^(✅|❌)/, "").trim()}
        </p>
      )}

      <div className="recipe-list-container">
        {favoriteRecipes.length === 0 ? (
          <p className="status-message info-no-border">
            선호하는 레시피가 아직 없습니다.
          </p>
        ) : (
          <ul className="ingredient-list">
            {favoriteRecipes.map((recipe, index) => (
              <li
                key={recipe.id || index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <h3>⭐ {recipe.recipeName || recipe.name}</h3>
                <p
                  style={{
                    fontSize: "0.9em",
                    color: "#6c757d",
                    margin: "5px 0",
                  }}
                >
                  {recipe.recipeDescription || recipe.description}
                </p>
                {recipe.sourceIngredients && (
                  <p style={{ fontSize: "0.8em", color: "#333" }}>
                    (선택 당시 재료: {recipe.sourceIngredients})
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <hr />
    </div>
  );
}

export default Preferrecipes;
