// src/components/MyRecipes.js (실제 DB 연동 버전)

import React, { useState, useEffect, useCallback } from "react";
import useApi from "../hook/useApi";
import "../css/Myfridge.css"; // 기본 CSS 사용
import "../css/Myrecipes.css"; // 레시피 전용 CSS 사용
import YouTube from "./YouTube"; // 🎯 YouTube 컴포넌트 (실제 API 연동 구조)

function MyRecipes({ lastAnalyzedResult }) {
  const api = useApi();
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 🎯 현재 상세 정보가 펼쳐진 레시피의 ID를 저장합니다.
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);

  // 🎯 1. AI 분석 결과를 목록 형태로 변환 및 상태 설정
  const processAnalyzedResult = useCallback(() => {
    setIsLoading(true);
    setMessage("AI 분석 결과를 처리 중...");

    let dataToSet = [];

    // [주요 경로] 서버가 여러 레시피를 담은 배열을 반환했을 경우 (5개 이상 추천)
    if (lastAnalyzedResult && Array.isArray(lastAnalyzedResult)) {
      dataToSet = lastAnalyzedResult;
      setMessage(`✅ ${lastAnalyzedResult.length}개의 조리법을 불러왔습니다.`);

      // [Fallback] 서버가 배열 대신 단일 JSON 객체 형태를 반환했을 경우
    } else if (lastAnalyzedResult && lastAnalyzedResult.dish_name) {
      dataToSet = [
        {
          // 실제 ID가 없을 경우 임시 ID 사용
          id: lastAnalyzedResult.id || 1,
          name: lastAnalyzedResult.dish_name,
          description: lastAnalyzedResult.description,
          time: lastAnalyzedResult.time || "정보 없음", // AI 응답에 시간이 있다면 사용
          steps: lastAnalyzedResult.steps || lastAnalyzedResult.description, // 단계/설명
          input_ingredients: lastAnalyzedResult.input_ingredients,
        },
      ];
      setMessage("✅ AI 분석 결과 (단일)를 표시합니다.");
    } else {
      setMessage("ℹ️ 분석 결과가 유효하지 않거나 조리법이 없습니다.");
    }

    setRecipes(dataToSet);
    setIsLoading(false);
    setTimeout(() => setMessage(""), 3000);
  }, [lastAnalyzedResult]); // 🎯 [유지] DB 연동 데이터에 의존

  useEffect(() => {
    processAnalyzedResult();
  }, [processAnalyzedResult]);

  // 🎯 2. 선호 레시피 추가 로직 (POST) - DB 로직 유지
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

    // DB에 저장할 데이터 페이로드
    const payload = {
      recipeName: recipe.name,
      recipeDescription: recipe.description,
      sourceIngredients: recipe.input_ingredients,
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

  // 🎯 3. 목록 아이템 클릭 시 상세 정보 토글 (유지)
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
            추천할 조리법이 없습니다.
          </p>
        ) : (
          <ul className="ingredient-list">
            {recipes.map((recipe, index) => {
              const isExpanded = expandedRecipeId === recipe.id;
              const videoCount = isExpanded ? 3 : 1;

              return (
                <li
                  key={recipe.id || `ai-${index}`}
                  className="recipe-list-item"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    position: "relative",
                    cursor: "pointer",
                  }}
                  onClick={() => handleRecipeClick(recipe.id)}
                >
                  {/* A. 요약 뷰 (클릭 영역) */}
                  {!isExpanded && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      <h3 style={{ margin: "0", flexGrow: 1 }}>
                        {recipe.name}
                      </h3>

                      {/* 🎯 [YouTube 연결] 1개 영상 요청 (썸네일) */}
                      <div
                        style={{
                          width: "150px",
                          height: "84px",
                          flexShrink: 0,
                          marginLeft: "10px",
                        }}
                      >
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
                      style={{
                        width: "100%",
                        marginTop: "15px",
                        padding: "10px",
                        borderTop: "1px dashed #ddd",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* 조리법 및 시간 */}
                      <p
                        style={{
                          fontWeight: "bold",
                          fontSize: "0.95em",
                          marginBottom: "8px",
                        }}
                      >
                        ✔️ 조리 시간: {recipe.time || "정보 없음"}
                      </p>
                      <p
                        style={{
                          fontSize: "0.9em",
                          color: "#333",
                          lineHeight: 1.4,
                        }}
                      >
                        {recipe.steps || recipe.description}
                      </p>

                      <hr style={{ margin: "15px 0" }} />

                      {/* 🎯 [YouTube 연결] 3개 영상 요청 (썸네일/텍스트 목록) */}
                      <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
                        🎥 참고 유튜브 영상 ({videoCount}개)
                      </p>
                      <YouTube
                        recipeName={recipe.name}
                        videoCount={videoCount}
                      />

                      <p
                        style={{
                          fontSize: "0.8em",
                          color: "#6c757d",
                          marginTop: "10px",
                        }}
                      >
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
