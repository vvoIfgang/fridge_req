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
  // 🎯 현재 상세 정보가 펼쳐진 레시피의 ID를 저장
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);

  // 유틸리티 함수
  const getMessageType = (msg) => {
    if (msg.startsWith("✅")) return "success";
    if (msg.startsWith("❌")) return "error";
    return "info";
  };

  // 1. ⚙️ 선호 레시피 목록 조회 로직 (GET) - 💡 AI 스키마 매핑 확장 (steps 내용을 description에 통합)
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

      const rawData = Array.isArray(response)
        ? response
        : response.favorites || [];

      // 💡 [수정] DB에 저장된 AI 스키마 필드를 모두 매핑
      const mappedData = rawData.map((item) => {
        const ingrs = (item.ingredients?.main || []).join(", "); // 재료 배열을 문자열로

        return {
          // 기본 필드
          id: item.id || item.recipeId,
          name: item.dish_name || item.recipeName || item.name,

          description:
            item.steps ||
            item.description ||
            item.recipeDescription ||
            "상세 조리법 정보 없음",

          category: item.meta_info?.category || "정보 없음",
          recommend: item.meta_info?.recommend || "정보 없음",
          taste: item.meta_info?.taste || "정보 없음",
          input_ingredients: ingrs, // 화면에 표시할 재료 문자열
        };
      });

      setFavoriteRecipes(mappedData);
      setMessage(`✅ ${mappedData.length}개의 선호 레시피를 불러왔습니다.`);
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

  // 2. 🗑️ 선호 레시피 삭제 로직 (DELETE) - 기존 유지
  const handleDeleteFavorite = async (id, name) => {
    if (
      !window.confirm(
        `정말로 선호 레시피 목록에서 '${name}'을/를 삭제하시겠습니까?`
      )
    ) {
      return;
    }

    setIsLoading(true);
    setMessage(`'${name}' 선호 레시피 삭제 요청 중...`);

    try {
      // 🚨 /api/recipes/favorites/:id 엔드포인트 가정
      await api.delete(`/api/recipes/favorites/${id}`);

      // 프론트엔드 상태 업데이트
      setFavoriteRecipes(favoriteRecipes.filter((recipe) => recipe.id !== id));
      setMessage(`✅ '${name}'이/가 선호 레시피 목록에서 삭제되었습니다.`);
      setExpandedRecipeId(null); // 삭제 후 상세 뷰 닫기
    } catch (error) {
      console.error("Delete Favorite Error:", error);
      setMessage(`❌ 삭제 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // 3. 목록 아이템 클릭 시 상세 정보 토글 - 기존 유지
  const handleRecipeClick = (id) => {
    setExpandedRecipeId(expandedRecipeId === id ? null : id);
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
            {favoriteRecipes.map((recipe, index) => {
              const recipeId = recipe.id || `fav-${index}`;
              const isExpanded = expandedRecipeId === recipeId;

              return (
                <li
                  key={recipeId}
                  className="recipe-list-item"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    position: "relative",
                    cursor: "pointer", // 클릭 가능 표시
                  }}
                >
                  {/* 요약 뷰 (클릭 영역) */}
                  <div
                    className="recipe-summary-view-fav"
                    onClick={() => handleRecipeClick(recipeId)} // 클릭 시 상세 토글
                  >
                    <h3 style={{ margin: "0", flexGrow: 1 }}>
                      ⭐ {recipe.name}
                    </h3>

                    {/* 카테고리 및 선호도 요약 표시 */}
                    <div
                      className="recipe-meta-summary"
                      style={{ marginRight: "10px" }}
                    >
                      <span className="recipe-category">
                        [{recipe.category}]
                      </span>
                      <span className="recipe-recommend">
                        선호도: {recipe.recommend}점
                      </span>
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 목록 토글 방지
                        handleDeleteFavorite(recipe.id, recipe.name);
                      }}
                      disabled={isLoading}
                      className="delete-btn"
                      style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        zIndex: 10,
                      }}
                    >
                      삭제
                    </button>
                  </div>

                  {/* B. 상세 뷰 (클릭 시 확장) */}
                  {isExpanded && (
                    <div
                      className="recipe-detail-view"
                      // 상세 내용을 클릭해도 리스트가 닫히지 않도록 버블링 방지
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* 상세 메타 정보 (카테고리, 선호도, 맛) */}
                      <div className="recipe-meta-detail">
                        <p>
                          카테고리: <strong>{recipe.category}</strong>
                        </p>
                        <p>
                          선호도: <strong>{recipe.recommend}점</strong>
                        </p>
                        <p>
                          주요 맛: <strong>{recipe.taste}</strong>
                        </p>
                        <p>
                          재료: <strong>{recipe.input_ingredients}</strong>
                        </p>
                      </div>

                      <hr style={{ margin: "10px 0" }} />

                      {/* 상세 설명 (조리법) */}
                      <p className="recipe-steps-info">{recipe.description}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Preferrecipes;
