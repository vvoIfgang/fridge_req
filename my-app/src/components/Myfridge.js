// src/components/MyRefrigerator.js (DB 연결 유지 및 목록 헤더 통합)

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hook/useApi";
import "../css/Myfridge.css";
import MyRecipes from "./Myrecipes";

// 이미지 파일 import (애니메이션에 사용)
import Magnify from "../images/magnify.png";
import IconSave from "../images/correction.png";
import IconDelete from "../images/delete.png";
import IconAdd from "../images/add.png";
// import IconUpload from "../images/upload.png"; // 사용하지 않는 이미지 제거

function MyRefrigerator() {
  const { userName: loginId } = useAuth();
  const api = useApi();

  // 1. 🍚 냉장고 재료 목록 및 메시지 상태
  const [ingredient, setIngredient] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 2. 뷰 모드 및 AI 분석 관련 상태
  const [viewMode, setViewMode] = useState("fridge");
  const [lastAnalyzedResult, setLastAnalyzedResult] = useState(null);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  // isSaved 상태는 DB 로직에서 사용하지 않으므로 제거하거나 주석 처리할 수 있으나,
  // 기존 코드에 있었으므로 임시로 유지합니다. (DB 코드에서는 불필요)
  // const [isSaved, setIsSaved] = useState(false);

  // 3. 폼 상태 (추가/수정)
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", quantity: "" });

  // 4. 🚀 CRUD 애니메이션 상태
  const [isAnalyzeLoading, setIsAnalyzeLoading] = useState(false);
  const [isFeedbackActive, setIsFeedbackActive] = useState(false);
  const [feedbackIcon, setFeedbackIcon] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // 5. ⚙️ 재료 목록 조회 로직 (GET)
  const fetchIngredient = useCallback(async () => {
    if (!loginId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setMessage("냉장고 정보를 불러오는 중...");

    try {
      const response = await api.get(`/api/fridge`);
      let rawData = Array.isArray(response)
        ? response
        : response.ingredient || [];

      const mappedData = rawData.map((item) => ({
        id: item.id,
        name: item.ingreName,
        quantity: item.quantity,
      }));
      setIngredient(mappedData);
      setMessage("✅ 정보를 성공적으로 불러왔습니다.");
    } catch (error) {
      console.error("Fetch Error:", error);
      setMessage(`❌ 정보 불러오기 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }, [loginId, api]);

  useEffect(() => {
    fetchIngredient();
  }, [fetchIngredient]);

  // 6. 📝 입력 필드 변경 핸들러
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 7. ✍️ 수정/추가 폼 열기 핸들러
  const handleOpenForm = (item = null) => {
    setViewMode("fridge");
    setIsAnalysisComplete(false);

    if (isAnalyzing) setIsAnalyzing(false);
    setSelectedIngredients([]);

    setEditingId(null);
    setIsAdding(false);

    if (item) {
      setEditingId(item.id);
      setFormData({ name: item.name, quantity: item.quantity });
    } else {
      setIsAdding(true);
      setFormData({ name: "", quantity: "" });
    }
  };

  // 8. 💾 재료 추가/수정 로직 (POST/PUT) - 애니메이션 통합
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, quantity } = formData;
    const trimmedName = name.trim();

    if (!trimmedName || !quantity.trim()) {
      setMessage("❌ 재료 이름과 개수를 모두 입력해 주세요.");
      return;
    }

    // --- 1단계: 애니메이션 시작 (로딩 상태) ---
    const completionTime = 0;
    const iconKey = editingId ? "Save" : "Add";
    const processingMsg = editingId
      ? `'${trimmedName}' 정보 수정 요청 중...`
      : `'${trimmedName}' 냉장고에 추가 요청 중...`;

    setIsLoading(true);
    setIsFeedbackActive(true);
    setFeedbackIcon(iconKey);
    setFeedbackMessage(processingMsg);
    // --- ---------------------------------- ---

    const payload = { name: trimmedName, quantity };
    let finalMessage = "";

    try {
      if (editingId) {
        // 수정 로직
        await api.put(`/api/fridge/update`, { ...payload, id: editingId });

        const updatedIngredients = ingredient.map((item) =>
          item.id === editingId
            ? { ...item, name: trimmedName, quantity }
            : item
        );
        setIngredient(updatedIngredients);
        finalMessage = `✅ '${trimmedName}' 정보가 수정되었습니다.`;
        setEditingId(null);
      } else {
        // 추가 로직
        const response = await api.post(`/api/fridge/add`, payload);

        const newItem = {
          id: response.id || Date.now(),
          name: trimmedName,
          quantity: quantity,
        };
        setIngredient((prev) => [...prev, newItem]);
        finalMessage = `✅ '${trimmedName}'를 냉장고에 추가했습니다.`;
        setIsAdding(false);
      }

      // --- 2단계: 성공 메시지 업데이트 및 애니메이션 종료 ---
      setFeedbackMessage(finalMessage.replace("✅ ", "") + " 완료!");

      setTimeout(() => {
        setTimeout(() => {
          setIsFeedbackActive(false);
          setIsLoading(false);
          setMessage(finalMessage);
          setFormData({ name: "", quantity: "" });
          setTimeout(() => setMessage(""), 3000);
        }, completionTime);
      }, 1000);
      // --- ------------------------------------------ ---
    } catch (error) {
      console.error(editingId ? "Update Error:" : "Add Error:", error);
      // --- 에러 시 애니메이션 종료 및 메시지 표시 ---

      setIsFeedbackActive(false);
      setIsLoading(false);
      setMessage(`❌ ${editingId ? "수정" : "추가"} 실패: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
      // --- ------------------------------------ ---
    }
  };

  // 9. 🗑️ 재료 삭제 로직 (DELETE) - 애니메이션 통합
  const handleDeleteIngredient = async (id, name) => {
    if (!window.confirm(`정말로 '${name}'을/를 삭제하시겠습니까?`)) {
      return;
    }
    // --- 1단계: 애니메이션 시작 (로딩 상태) ---
    const completionTime = 0;

    setIsLoading(true);
    setIsFeedbackActive(true);
    setFeedbackIcon("Delete");
    setFeedbackMessage(`'${name}' 삭제 요청 중...`);
    // --- ---------------------------------- ---
    let finalMessage = "";

    try {
      await api.delete(`/api/fridge/${id}`);
      setIngredient(ingredient.filter((item) => item.id !== id));
      finalMessage = `✅ '${name}'를 냉장고에서 삭제했습니다.`;

      // --- 2단계: 성공 메시지 업데이트 및 애니메이션 종료 ---
      setFeedbackMessage(finalMessage.replace("✅ ", "") + " 완료!");

      setTimeout(() => {
        setTimeout(() => {
          setIsFeedbackActive(false);
          setIsLoading(false);
          setMessage(finalMessage);
          setTimeout(() => setMessage(""), 3000);
        }, completionTime);
      }, 1000);
      // --- ------------------------------------------ ---
    } catch (error) {
      console.error("Delete Error:", error);
      // --- 에러 시 애니메이션 종료 및 메시지 표시 ---

      setIsFeedbackActive(false);
      setIsLoading(false);
      setMessage(`❌ 재료 삭제 실패: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
      // --- ------------------------------------ ---
    }
  };

  // 10. ❌ 폼/분석 취소
  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", quantity: "" });
    setViewMode("fridge");
    setIsAnalysisComplete(false);
    setIsAnalyzing(false);
    setSelectedIngredients([]);
    // setIsSaved(false); // DB 코드에서는 불필요
    // setAnalyzedRecipe(null); // DB 코드에서는 불필요
    setMessage("");
  };

  // 11. 체크박스 토글 핸들러
  const handleToggleSelect = (id) => {
    setSelectedIngredients((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 12. AI 분석 요청 핸들러 - 애니메이션 통합 (DB 로직 유지)
  const handleAnalyzeIngredients = async () => {
    if (selectedIngredients.length === 0) {
      setMessage("❌ 분석할 재료를 하나 이상 선택해 주세요.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    // --- 1단계: 분석 애니메이션 시작 ---
    setIsLoading(true);
    setIsAnalyzeLoading(true);
    // --- -------------------------- ---

    const ingredientsToSend = ingredient
      .filter((item) => selectedIngredients.includes(item.id))
      .map(({ name }) => ({ name }));

    const payload = { ingredients: ingredientsToSend };

    try {
      const analysisResponse = await api.post(`/api/fridge/analyze`, payload);

      if (
        analysisResponse &&
        analysisResponse.status === "success" &&
        analysisResponse.dish_name
      ) {
        setLastAnalyzedResult(analysisResponse);
        await api.post(`/api/fridge/save`, analysisResponse);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setIsAnalyzeLoading(false);
        setIsAnalysisComplete(true);
        setMessage(`✅ AI 분석 완료. 추천 조리법을 저장했습니다.`);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setViewMode("recipes");
        setIsLoading(false);
        setIsAnalyzing(false);
        setSelectedIngredients([]);
        setIsAnalysisComplete(false);
        setTimeout(() => setMessage(""), 3000);
      } else {
        // AI 분석은 성공했으나 유효한 조리법을 찾지 못한 경우
        setIsAnalyzeLoading(false);
        setIsLoading(false);
        setIsAnalyzing(false);
        setSelectedIngredients([]);
        setLastAnalyzedResult(null);
        setMessage(`❌ AI 분석 실패: 유효한 조리법을 찾을 수 없습니다.`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("AI Analyze/Save Error:", error);
      // --- 에러 시 애니메이션 즉시 종료 및 메시지 표시 ---

      setIsAnalyzeLoading(false);
      setIsLoading(false);
      setIsAnalyzing(false);
      setSelectedIngredients([]);
      setLastAnalyzedResult(null);
      setMessage(`❌ AI 분석 요청 또는 저장 실패: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
      // --- ------------------------------------ ---
    }
  };

  // 13. 분석 취소 핸들러
  const handleAnalyzeCancel = () => {
    setIsAnalyzing(false);
    setSelectedIngredients([]);
    setMessage("");
  };

  const getMessageType = (msg) => {
    if (msg.startsWith("✅")) return "success";
    if (msg.startsWith("❌")) return "error";
    return "info";
  };

  // 14. 아이콘 컴포넌트
  const getFeedbackIconComponent = (icon) => {
    let imgSrc;
    let imgAlt;

    switch (icon) {
      case "Save":
        imgSrc = IconSave;
        imgAlt = "저장";
        break;
      case "Add":
        imgSrc = IconAdd;
        imgAlt = "추가";
        break;
      case "Delete":
        imgSrc = IconDelete;
        imgAlt = "삭제";
        break;
      case "Complete":
        return null;
      default:
        return null;
    }
    return <img src={imgSrc} alt={imgAlt} />;
  };

  // 초기 로딩 상태 처리
  if (
    isLoading &&
    !message.includes("요청 중") &&
    !isAnalyzeLoading &&
    !isFeedbackActive
  ) {
    return <div className="profile-loading">냉장고 정보를 불러오는 중...</div>;
  }

  const isFormActive = isAdding || editingId !== null;
  const isAnyActive = isFormActive || isAnalyzing;

  // 15. 🎯 [뷰 분기] 레시피 모드 렌더링
  if (viewMode === "recipes") {
    return (
      <MyRecipes
        setViewMode={setViewMode}
        analyzedRecipe={lastAnalyzedResult}
      />
    );
  }

  // 16. 기본 냉장고 뷰 렌더링 (통합된 IngredientList 포함)
  return (
    <>
      {/* 🚀 분석 로딩 오버레이 */}
      <div
        className={`analyze-loading-overlay ${
          isAnalyzeLoading || isAnalysisComplete ? "is-active" : ""
        }`}
      >
        {isAnalyzeLoading && (
          <>
            <div className="loading-magnifier">
              <img
                src={Magnify}
                alt="분석 중"
                className="loading-magnifier-image"
              />
            </div>
            <p style={{ fontSize: "1.5em", color: "#343a40", fontWeight: 600 }}>
              재료를 AI가 분석하는 중입니다...
            </p>
          </>
        )}
        {/* 분석 완료 메시지는 Analysis Complete 상태일 때만 표시 */}
        {isAnalysisComplete && !isAnalyzeLoading && (
          <div className="analysis-complete-message show">
            분석을 완료하였습니다!
          </div>
        )}
      </div>

      {/* 💾 CRUD 피드백 오버레이 */}
      <div
        className={`crud-feedback-overlay ${
          isFeedbackActive ? "is-active" : ""
        }`}
      >
        <div className="feedback-content">
          <div className="feedback-icon">
            {getFeedbackIconComponent(feedbackIcon)}
          </div>
          <p className="feedback-message">{feedbackMessage}</p>
        </div>
      </div>

      <div className="profile-page-container">
        <h2>나의 냉장고 관리</h2>
        {message && (
          <p className={`status-message ${getMessageType(message)}`}>
            {message.replace(/^(✅|❌)/, "").trim()}
          </p>
        )}

        {/* 1. 재료 추가 폼 영역 */}
        <div className="add-ingredient-section">
          {isAdding && !editingId ? (
            <form onSubmit={handleSubmit} className="add-form">
              <h3>새 재료 추가</h3>
              <div className="add-form-fields">
                <div className="form-group-inline">
                  <label htmlFor="add-name">재료명</label>
                  <input
                    type="text"
                    id="add-name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="예: 토마토"
                    required
                  />
                </div>
                <div className="form-group-inline">
                  <label htmlFor="add-quantity">개수</label>
                  <input
                    type="text"
                    id="add-quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    placeholder="예: 5개, 1kg"
                    required
                  />
                </div>
              </div>
              <div className="button-group add-button-group">
                <button type="submit" className="save-btn" disabled={isLoading}>
                  추가
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-btn"
                  disabled={isLoading}
                >
                  취소
                </button>
              </div>
            </form>
          ) : null}
        </div>

        {/* 2. 통합된 재료 목록 (IngredientList 로직) */}
        <div className="refrigerator-list-container">
          <h3>
            보유 재료 ({ingredient.length}개)
            {isAnalyzing && (
              <span className="analyze-mode-tip">
                (분석할 재료를 선택하세요)
              </span>
            )}
          </h3>

          <div className="ingredient-list-wrapper">
            {ingredient.length === 0 ? (
              <p className="status-message info-no-border">
                냉장고가 비어있습니다. 재료를 추가해 주세요!
              </p>
            ) : (
              <ul className="ingredient-list">
                {/* ★★★ 1. 새로운 헤더 행 (첫 번째 li로 통합) ★★★ */}
                <li className="ingredient-list-header-row">
                  {isAnalyzing && (
                    <span className="analyze-checkbox-header">선택</span>
                  )}
                  <span className="ingredient-name-col">재료 이름</span>
                  <span className="ingredient-quantity-col">수량</span>
                  <span className="button-group-col">관리</span>
                </li>

                {/* 2. 실제 재료 데이터 맵핑 */}
                {ingredient.map((item) => (
                  <li
                    key={item.id}
                    className={editingId === item.id ? "editing" : ""}
                  >
                    {isAnalyzing && (
                      <div className="analyze-checkbox-container">
                        <input
                          type="checkbox"
                          checked={selectedIngredients.includes(item.id)}
                          onChange={() => handleToggleSelect(item.id)}
                          disabled={isLoading}
                        />
                      </div>
                    )}

                    {editingId !== item.id ? (
                      <>
                        <div className="ingredient-info">
                          <span className="ingredient-name-col">
                            {item.name}
                          </span>
                          <span className="ingredient-quantity-col">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="button-group button-group-col">
                          {!isAnalyzing && (
                            <div className="button-group">
                              <button
                                onClick={() => handleOpenForm(item)}
                                className="edit-btn"
                                disabled={isAnyActive || isLoading}
                              >
                                수정
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteIngredient(item.id, item.name)
                                }
                                className="delete-btn"
                                disabled={isAnyActive || isLoading}
                              >
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      // 수정 폼 (인라인)
                      <form
                        onSubmit={handleSubmit}
                        className="edit-inline-form"
                      >
                        <div className="ingredient-name-col">
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            placeholder="재료명"
                            required
                          />
                        </div>
                        <div className="ingredient-quantity-col">
                          <input
                            type="text"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleFormChange}
                            placeholder="예: 2개"
                          />
                        </div>
                        <div className="button-group button-group-col">
                          <div className="button-group">
                            <button
                              type="submit"
                              className="save-btn"
                              disabled={isLoading || isFeedbackActive}
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              onClick={handleCancel}
                              className="cancel-btn"
                              disabled={isLoading || isFeedbackActive}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <hr />

        {/* 3. 재료 분석 요청/취소 버튼 그룹 (분석 모드일 때만 표시) */}
        {!isFormActive && isAnalyzing && (
          <div className="add-ingredient-section">
            <div className="button-actions-top">
              <div className="button-group analyze-button-group">
                <button
                  onClick={handleAnalyzeIngredients}
                  className="analyze-request-btn"
                  disabled={selectedIngredients.length === 0 || isLoading}
                >
                  {isLoading
                    ? "분석 및 저장 요청 중..."
                    : `분석 요청하기 (${selectedIngredients.length}개 선택)`}
                </button>
                <button
                  type="button"
                  onClick={handleAnalyzeCancel}
                  className="cancel-btn"
                  disabled={isLoading}
                >
                  분석 취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. 재료 분석/추가 버튼 그룹 (폼도 분석 모드도 아닐 때만 표시) */}
        <div className="add-ingredient-section">
          {!isFormActive && !isAnalyzing && (
            <div className="button-actions-top">
              <div className="button-group add-analyze-group">
                {ingredient.length > 0 && ( // 재료가 있을 때만 분석 버튼 표시
                  <button
                    onClick={() => {
                      setIsAnalyzing(true);
                    }}
                    className="analyze-btn"
                    disabled={isLoading}
                  >
                    재료 분석하기
                  </button>
                )}
                <button
                  onClick={() => handleOpenForm(null)}
                  className="add-btn"
                  disabled={isLoading}
                >
                  재료 추가
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyRefrigerator;
