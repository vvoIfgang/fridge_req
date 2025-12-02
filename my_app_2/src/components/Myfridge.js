// src/pages/mypage/MyRefrigerator.js

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hook/useApi";
import "../css/Myfridge.css"; // CSS 사용

// 🚨 API 응답/요청 형태: {id: number, name: string, quantity: string} 객체 배열을 사용한다고 가정

function MyRefrigerator() {
  const { userName: loginId } = useAuth();
  const api = useApi();

  const [ingredient, setIngredient] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 폼 상태
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", quantity: "" });

  // 1. ⚙️ 재료 목록 조회 로직 (GET)
  const fetchIngredient = useCallback(async () => {
    if (!loginId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setMessage("냉장고 정보를 불러오는 중...");

    try {
      const response = await api.get(`/api/fridge`);

      if (Array.isArray(response)) {
        setIngredient(response);
      } else if (Array.isArray(response.ingredient)) {
        setIngredient(response.ingredient);
      } else {
        setIngredient([]);
      }
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

  // 2. 📝 입력 필드 변경 핸들러 (생략)
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. ✍️ 수정/추가 폼 열기 핸들러 (생략)
  const handleOpenForm = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ name: item.name, quantity: item.quantity });
      setIsAdding(false);
    } else {
      setEditingId(null);
      setFormData({ name: "", quantity: "" });
      setIsAdding(true);
    }
  };

  // 4. 💾 재료 추가/수정 로직 (POST/PUT) (생략)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, quantity } = formData;
    const trimmedName = name.trim();

    if (!trimmedName || !quantity.trim()) {
      setMessage("❌ 재료 이름과 개수를 모두 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    setMessage(editingId ? "재료 수정 요청 중..." : "재료 추가 요청 중...");

    const payload = { name: trimmedName, quantity };

    try {
      if (editingId) {
        await api.put(`/api/fridge/update`, { ...payload, id: editingId });

        setIngredient(
          ingredient.map((item) =>
            item.id === editingId
              ? { ...item, name: trimmedName, quantity }
              : item
          )
        );
        setMessage(`✅ '${trimmedName}' 정보가 수정되었습니다.`);
        setEditingId(null);
      } else {
        const response = await api.post(`/api/fridge/add`, payload);
        const newItem = {
          id: response.id, // 서버가 준 ID 사용
          name: payload.name,
          quantity: payload.quantity,
        };
        setIngredient((prev) => [...prev, newItem]);
        setMessage(`✅ '${trimmedName}'를 냉장고에 추가했습니다.`);
        setIsAdding(false);
      }
    } catch (error) {
      console.error(editingId ? "Update Error:" : "Add Error:", error);
      setMessage(`❌ ${editingId ? "수정" : "추가"} 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
      setFormData({ name: "", quantity: "" });
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // 5. 🗑️ 재료 삭제 로직 (DELETE) (생략)
  const handleDeleteIngredient = async (id, name) => {
    if (!window.confirm(`정말로 '${name}'을/를 삭제하시겠습니까?`)) {
      return;
    }

    setIsLoading(true);
    setMessage("재료 삭제 요청 중...");

    try {
      await api.delete(`/api/fridge/${id}`);

      setIngredient(ingredient.filter((item) => item.id !== id));
      setMessage(`✅ '${name}'를 냉장고에서 삭제했습니다.`);
    } catch (error) {
      console.error("Delete Error:", error);
      setMessage(`❌ 재료 삭제 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // 6. ❌ 폼 취소 (생략)
  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", quantity: "" });
  };

  if (isLoading && !message.includes("요청 중")) {
    return <div className="profile-loading">냉장고 정보를 불러오는 중...</div>;
  }

  return (
    <div className="profile-page-container">
      <h2>나의 냉장고 관리</h2>
      {message && (
        <p
          className={`status-message ${
            message.startsWith("✅")
              ? "success"
              : message.startsWith("❌")
              ? "error"
              : "info"
          }`}
        >
          {message.replace(/^(✅|❌)/, "").trim()}
        </p>
      )}

      {/* 1. 재료 목록 표시 */}
      <div className="refrigerator-list-container">
        <h3>보유 재료 ({ingredient.length}개)</h3>

        {/* 데이터 테이블 외곽선 및 헤더 역할 컨테이너 */}
        <div className="ingredient-list-wrapper">
          {/* 테이블 헤더 역할 */}
          <div className="ingredient-header">
            <span className="ingredient-name">
              재료 이름과 수량을 입력하세요
            </span>
            <span className="button-group">관리</span> {/* 관리 버튼 영역 */}
          </div>

          {ingredient.length === 0 ? (
            <p className="status-message info no-border">
              냉장고가 비어있습니다. 재료를 추가해 주세요!
            </p>
          ) : (
            <ul className="ingredient-list">
              {ingredient.map((item) => (
                <li
                  key={item.id}
                  className={editingId === item.id ? "editing" : ""}
                >
                  {editingId === item.id ? (
                    // 2-1. 수정 폼 (목록 내부)
                    <form onSubmit={handleSubmit} className="edit-form">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="재료명"
                        required
                      />
                      <input
                        type="text"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleFormChange}
                        placeholder="개수 (예: 2개)"
                        required
                      />
                      <div className="button-group">
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
                  ) : (
                    // 1-1. 재료 표시 (오른쪽 버튼)
                    <>
                      <div className="ingredient-info">
                        <span className="ingredient-name">{item.name}</span>
                        <span className="ingredient-quantity">
                          ({item.quantity})
                        </span>
                      </div>
                      <div className="button-group">
                        <button
                          onClick={() => handleOpenForm(item)}
                          className="edit-btn"
                          disabled={isLoading}
                        >
                          수정
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteIngredient(item.id, item.name)
                          }
                          className="cancel-btn"
                          disabled={isLoading}
                        >
                          삭제
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 3. 재료 추가 버튼 및 폼 */}
      <div className="add-ingredient-section">
        {!isAdding && !editingId ? (
          <button
            onClick={() => handleOpenForm(null)}
            className="edit-btn primary-add-btn" // CSS로 버튼 폭 제어
            disabled={isLoading}
          >
            재료 추가 입력
          </button>
        ) : isAdding && !editingId ? (
          // 3-1. 추가 폼
          <form onSubmit={handleSubmit} className="add-form">
            <h3>새 재료 추가</h3>

            <div className="add-form-fields">
              {" "}
              {/* 필드 컨테이너 */}
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
    </div>
  );
}

export default MyRefrigerator;
