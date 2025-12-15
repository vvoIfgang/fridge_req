// src/components/MyRecipes.js (실제 DB 연동 버전)

import React, { useState, useEffect, useCallback } from "react";
import useApi from "../hook/useApi";
import "../css/Myfridge.css"; // 기본 CSS 사용
import "../css/Myrecipes.css"; // 레시피 전용 CSS 사용
import YouTube from "./YouTube"; // 🎯 YouTube 컴포넌트 (실제 API 연동 구조)

function MyRecipes() {
  const api = useApi();
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 🎯 현재 상세 정보가 펼쳐진 레시피의 ID를 저장합니다.
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);

  // 🎯 1. DB에서 레시피 목록을 조회하는 로직 (GET) - 💡 AI 스키마 모든 필드 매핑 포함
  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    setMessage("저장된 AI 추천 조리법 목록을 불러오는 중...");

    try {
      // 서버에서 DB에 저장된 분석 결과/추천 레시피 목록을 조회합니다.
      const response = await api.get(`/api/recipes/list`);

      // 서버 응답 형태에 따라 데이터를 매핑합니다.
      const mappedRecipes = Array.isArray(response)
        ? response.map((item) => {
            const ingredientsArray =
              (item.ingredients && item.ingredients.main) || [];

            return {
              id: item.id,
              name: item.recipeName || item.dish_name,
              description: item.recipeDescription || item.description,
              time: item.time || "정보 없음", // AI 스키마에 없는 필드는 기본값 설정
              steps: item.steps || item.recipeDescription || item.description, // AI 스키마에 없는 필드는 description 대체

              // 💡 [핵심 수정 1]: AI 스키마의 모든 필드를 상태에 명시적으로 저장
              category: item.meta_info?.category || "정보 없음",
              recommend: item.meta_info?.recommend || "정보 없음",
              taste: item.meta_info?.taste || "정보 없음",
              input_ingredients:
                ingredientsArray.join(", ") ||
                item.sourceIngredients ||
                item.input_ingredients ||
                "정보 없음",
              originalIngredients: ingredientsArray,
              originalMeta: item.meta_info || {},
            };
          })
        : [];

      setRecipes(mappedRecipes);
      setMessage(
        `✅ 총 ${mappedRecipes.length}개의 추천 조리법을 불러왔습니다.`
      );
    } catch (error) {
      console.error("Fetch Recipes Error:", error);
      setMessage(`❌ 조리법 목록 불러오기 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }, [api]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // 🎯 2. 선호 레시피 추가 로직 (POST) - 💡 AI 스키마 전체 필드 저장하도록 수정
  const handleToggleFavorite = async (recipe) => {
    if (
      !window.confirm(
        `'${recipe.name}'을/를 선호 레시피 목록에 추가하겠습니까?`
      )
    ) {
      return;
    }

    setIsLoading(true);
    setMessage(`'${recipe.name}' 선호 레시피 추가 요청 중...`);

    const payload = {
      // 필수 필드
      dish_name: recipe.name,
      description: recipe.description,

      // 메타 정보 (meta_info 스키마 구조에 맞게)
      meta_info: {
        category: recipe.category,
        recommend: recipe.recommend,
        taste: recipe.taste,
        ...recipe.originalMeta, // 원본에서 가져온 다른 메타 정보가 있다면 포함
      },

      // 재료 정보 (ingredients 스키마 구조에 맞게)
      ingredients: {
        main: recipe.originalIngredients || [], // 배열 형태의 재료를 사용
      },
    };

    try {
      await api.post(`/api/recipes/add-favorite`, payload);
      setMessage(
        `✅ '${recipe.name}'이/가 선호 레시피 목록에 성공적으로 추가되었습니다.`
      );
    } catch (error) {
      console.error("Favorite Add Error:", error);
      setMessage(`❌ 선호 레시피 추가 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // 🎯 3. 목록 아이템 클릭 시 상세 정보 토글
  const handleRecipeClick = (id) => {
    setExpandedRecipeId(expandedRecipeId === id ? null : id);
  };

  const getMessageType = (msg) => {
    if (msg.startsWith("✅")) return "success";
    if (msg.startsWith("❌")) return "error";
    return "info";
  };

  if (isLoading) {
    return <div className="profile-loading">조리법 목록을 준비 중...</div>;
  }

  return (
    <div className="profile-page-container">
      <h2>AI 추천 조리법</h2>
      {message && (
        <p className={`status-message ${getMessageType(message)}`}>
          {message.replace(/^(✅|❌)/, "").trim()}
        </p>
      )}

      <div className="recipe-list-container">
        {recipes.length === 0 ? (
          <p className="status-message info-no-border">
            추천할 조리법이 없습니다. 냉장고에 재료를 추가하고 AI 분석을 요청해
            보세요.
          </p>
        ) : (
          <ul className="ingredient-list">
            {recipes.map((recipe, index) => {
              // recipe.id가 없으면 임시로 index를 사용
              const recipeId = recipe.id || `ai-${index}`;
              const isExpanded = expandedRecipeId === recipeId;
              const videoCount = isExpanded ? 3 : 1;

              return (
                <li
                  key={recipeId}
                  className="recipe-list-item"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    position: "relative",
                    cursor: "pointer",
                  }}
                  onClick={() => handleRecipeClick(recipeId)}
                >
                  {/* A. 요약 뷰 (클릭 영역) */}
                  {!isExpanded && (
                    <div className="recipe-summary-view">
                      <h3 style={{ margin: "0", flexGrow: 1 }}>
                        {recipe.name}
                      </h3>

                      {/* 카테고리 및 선호도 요약 표시 */}
                      <div className="recipe-meta-summary">
                        <span className="recipe-category">
                          [{recipe.category}]
                        </span>
                        <span className="recipe-recommend">
                          ⭐ 선호도: {recipe.recommend}점
                        </span>
                      </div>

                      {/* 🎯 [YouTube 연결] 1개 영상 요청 (썸네일) */}
                      <div className="youtube-thumbnail-container">
                        <YouTube recipeName={recipe.name} videoCount={1} />
                      </div>
                    </div>
                  )}

                  {/* 상세 뷰일 때는 레시피 이름이 목록 내부에 표시 */}
                  {isExpanded && (
                    <h3 style={{ margin: "0 0 10px 0", flexGrow: 1 }}>
                      {recipe.name}
                    </h3>
                  )}

                  {/* 🎯 선호 레시피 추가 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(recipe);
                    }}
                    disabled={isLoading}
                    className="favorite-toggle-btn"
                    style={{ position: "absolute", top: "15px", right: "15px" }}
                  >
                    ⭐ 추가
                  </button>

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
                          ✔️ 카테고리: <strong>{recipe.category}</strong>
                        </p>
                        <p>
                          ✔️ 선호도: <strong>{recipe.recommend}점</strong>
                        </p>
                        <p>
                          ✔️ 주요 맛: <strong>{recipe.taste}</strong>
                        </p>
                      </div>

                      {/* 조리법 및 시간 */}
                      <p className="recipe-time-info">
                        ✔️ 조리 시간: {recipe.time || "정보 없음"}
                      </p>
                      <p className="recipe-steps-info">
                        {recipe.steps || recipe.description}
                      </p>

                      <hr style={{ margin: "15px 0" }} />

                      {/* 🎯 [YouTube 연결] 3개 영상 요청 */}
                      <p className="youtube-header">
                        🎥 참고 유튜브 영상 ({videoCount}개)
                      </p>
                      <YouTube
                        recipeName={recipe.name}
                        videoCount={videoCount}
                      />

                      <p className="recipe-source-info">
                        (입력 재료: {recipe.input_ingredients})
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <hr />
    </div>
  );
}

export default MyRecipes;

