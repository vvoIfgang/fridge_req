import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hook/useApi";
import "../css/Myfridge.css";
import MyRecipes from "./Myrecipes";

function MyRefrigerator() {
  const { userName: loginId } = useAuth();
  const api = useApi();

  // 1. 🍚 냉장고 재료 목록 및 메시지 상태
  const [ingredient, setIngredient] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 2. 뷰 모드 및 AI 분석 관련 상태
  const [viewMode, setViewMode] = useState("fridge"); // 'fridge' or 'recipes'
  const [lastAnalyzedResult, setLastAnalyzedResult] = useState(null);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  // 🎯 통합: 재료 목록에서 사용할 분석 모드 상태 및 선택된 재료 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]); // IngredientList에서 통합됨

  // 3. 폼 상태 (추가/수정)
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // 💡 변경: name -> ingreName
  const [formData, setFormData] = useState({ ingreName: "", quantity: "" });

  // 4. ⚙️ 재료 목록 조회 로직 (GET)
  const fetchIngredient = useCallback(async () => {
    if (!loginId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setMessage("냉장고 정보를 불러오는 중...");

    try {
      const response = await api.get(`/api/fridge`);
      console.log("API Response:", response);
      let data = Array.isArray(response) ? response : response.ingredient || [];
      setIngredient(data);
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

  // 5. 📝 입력 필드 변경 핸들러
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // 💡 name이 'ingreName' 또는 'quantity'일 때 처리
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 6. ✍️ 수정/추가 폼 열기 핸들러
  const handleOpenForm = (item = null) => {
    setViewMode("fridge");
    setIsAnalysisComplete(false);

    // 분석 모드 중이면 취소
    if (isAnalyzing) setIsAnalyzing(false);
    setSelectedIngredients([]); // 분석 모드 취소 시 선택된 재료 초기화

    setEditingId(null);
    setIsAdding(false);

    if (item) {
      setEditingId(item.id);
      // 💡 변경: name -> ingreName
      setFormData({ ingreName: item.ingreName, quantity: item.quantity });
    } else {
      setIsAdding(true);
      // 💡 변경: name -> ingreName
      setFormData({ ingreName: "", quantity: "" });
    }
  };

  // 7. 💾 재료 추가/수정 로직 (POST/PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 💡 변경: name 대신 ingreName 사용
    const { ingreName, quantity } = formData;
    const trimmedName = ingreName.trim();

    if (!trimmedName || !quantity.trim()) {
      setMessage("❌ 재료 이름과 개수를 모두 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    setMessage(editingId ? "재료 수정 요청 중..." : "재료 추가 요청 중...");

    // 💡 변경: API 페이로드도 ingreName 사용
    const payload = { ingreName: trimmedName, quantity };

    try {
      if (editingId) {
        // 수정 로직
        await api.put(`/api/fridge/update`, { ...payload, id: editingId });
        setIngredient(
          ingredient.map((item) =>
            item.id === editingId
              ? { ...item, ingreName: trimmedName, quantity } // 💡 변경
              : item
          )
        );
        setMessage(`✅ '${trimmedName}' 정보가 수정되었습니다.`);
        setEditingId(null);
      } else {
        // 추가 로직
        const response = await api.post(`/api/fridge/add`, payload);
        const newItem = {
          id: response.id,
          ingreName: payload.ingreName, // 💡 변경
          quantity: payload.quantity,
        };
        setIngredient((prev) => [...prev, newItem]);
        setMessage(`✅ '${trimmedName}'를 냉장고에 추가했습니다.`);
        setIsAdding(false);
        setFormData({ ingreName: "", quantity: "" }); // 💡 변경
      }
    } catch (error) {
      console.error(editingId ? "Update Error:" : "Add Error:", error);
      setMessage(`❌ ${editingId ? "수정" : "추가"} 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // 8. 🗑️ 재료 삭제 로직 (DELETE)
  // 💡 변경: name 대신 ingreName 사용
  const handleDeleteIngredient = async (id, ingreName) => {
    if (!window.confirm(`정말로 '${ingreName}'을/를 삭제하시겠습니까?`)) {
      return;
    }

    setIsLoading(true);
    setMessage("재료 삭제 요청 중...");

    try {
      await api.delete(`/api/fridge/${id}`);
      setIngredient(ingredient.filter((item) => item.id !== id));
      setMessage(`✅ '${ingreName}'를 냉장고에서 삭제했습니다.`);
    } catch (error) {
      console.error("Delete Error:", error);
      setMessage(`❌ 재료 삭제 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // 9. ❌ 폼/분석 취소
  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    // 💡 변경: name 대신 ingreName 사용
    setFormData({ ingreName: "", quantity: "" });
    setViewMode("fridge");
    setIsAnalysisComplete(false);
    setIsAnalyzing(false);
    setSelectedIngredients([]); // 분석 취소 시 선택된 재료 초기화
    setMessage("");
  };

  // 10. IngredientList 통합 - 체크박스 토글 핸들러
  const handleToggleSelect = (id) => {
    setSelectedIngredients((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 11. IngredientList 통합 - AI 분석 요청 핸들러
  const handleAnalyzeIngredients = async () => {
    if (selectedIngredients.length === 0) {
      setMessage("❌ 분석할 재료를 하나 이상 선택해 주세요.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setIsLoading(true);
    setMessage("AI 분석 요청 중...");

    // 💡 변경: name 대신 ingreName 사용
    const ingredientsToSend = ingredient
      .filter((item) => selectedIngredients.includes(item.id))
      .map(({ ingreName }) => ({ name: ingreName })); // 백엔드 분석 API가 name을 기대할 가능성이 높아 다시 name으로 변환하여 전송 (필요한 경우 수정 가능)
    // 원본 코드는 map(({ name }) => ({ name })); 였으므로, 여기서는 { name: ingreName }로 수정하여 백엔드 요구사항을 충족시키도록 함

    const payload = { ingredients: ingredientsToSend };

    try {
      const response = await api.post(`/api/fridge/analyze`, payload);

      if (response && response.status === "success" && response.dish_name) {
        setLastAnalyzedResult(response);
        setIsAnalysisComplete(true);
        setMessage(`✅ AI 분석 완료. 추천 조리법을 확인해 보세요.`);
      } else {
        setMessage(`❌ AI 분석 실패: 유효한 조리법을 찾을 수 없습니다.`);
        setLastAnalyzedResult(null);
      }
    } catch (error) {
      console.error("AI Analyze Error:", error);
      setLastAnalyzedResult(null);
      setMessage(`❌ AI 분석 요청 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
      setSelectedIngredients([]);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // 12. IngredientList 통합 - 분석 취소 핸들러
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

  if (isLoading && !message.includes("요청 중")) {
    return <div className="profile-loading">냉장고 정보를 불러오는 중...</div>;
  }

  const isFormActive = isAdding || editingId !== null;
  const isAnyActive = isFormActive || isAnalyzing; // 폼 활성 또는 분석 모드 활성

  // 13. 🎯 [뷰 분기] 레시피 모드 렌더링
  if (viewMode === "recipes") {
    return (
      <MyRecipes
        setViewMode={setViewMode}
        lastAnalyzedResult={lastAnalyzedResult}
      />
    );
  }

  // 14. 기본 냉장고 뷰 렌더링 (통합된 IngredientList 포함)
  return (
    <div className="profile-page-container">
      <h2>나의 냉장고 관리</h2>
      {message && (
        <p className={`status-message ${getMessageType(message)}`}>
          {message.replace(/^(✅|❌)/, "").trim()}
        </p>
      )}

      {/* 분석 완료 시 레시피 페이지로 이동하는 버튼 */}
      {viewMode === "fridge" && isAnalysisComplete && (
        <div className="analysis-result-prompt">
          <p className="status-message success">
            ✅ 새로운 조리법 분석이 완료되었습니다!
          </p>
          <div className="button-group">
            <button
              onClick={() => {
                setViewMode("recipes");
                setIsAnalysisComplete(false);
              }}
              className="analyze-request-btn"
            >
              추천 조리법 확인하기
            </button>
          </div>
        </div>
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
                  name="ingreName" // 💡 변경: name="ingreName"
                  value={formData.ingreName} // 💡 변경: formData.ingreName
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
            <span className="analyze-mode-tip">(분석할 재료를 선택하세요)</span>
          )}
        </h3>

        <div className="ingredient-list-wrapper">
          <div className="ingredient-header">
            {isAnalyzing && (
              <span className="analyze-checkbox-header">선택</span>
            )}
            <span className="ingredient-name-col">재료 이름</span>
            <span className="ingredient-quantity-col">수량</span>
            <span className="button-group-col">관리</span>
          </div>

          {ingredient.length === 0 ? (
            <p className="status-message info-no-border">
              냉장고가 비어있습니다. 재료를 추가해 주세요!
            </p>
          ) : (
            <ul className="ingredient-list">
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
                          {item.ingreName}
                        </span>{" "}
                        {/* 💡 변경: item.name -> item.ingreName */}
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
                              onClick={
                                () =>
                                  handleDeleteIngredient(
                                    item.id,
                                    item.ingreName
                                  ) // 💡 변경: item.name -> item.ingreName
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
                    <form onSubmit={handleSubmit} className="edit-inline-form">
                      <div className="ingredient-name-col">
                        <input
                          type="text"
                          name="ingreName" // 💡 변경: name="ingreName"
                          value={formData.ingreName} // 💡 변경: formData.name -> formData.ingreName
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
                          required
                        />
                      </div>
                      <div className="button-group button-group-col">
                        <button
                          type="submit"
                          className="save-btn"
                          disabled={isLoading}
                        >
                          저장
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
                  ? "분석 요청 중..."
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
  );
}

export default MyRefrigerator;
