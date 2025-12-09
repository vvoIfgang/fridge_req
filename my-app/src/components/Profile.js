// src/pages/mypage/Profile.js (수정 완료)

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import useApi from "../hook/useApi";

import "../css/Profile.css";

function Profile() {
  // Context에서 userName을 가져와 ID와 초기 이름으로 사용
  const { userName: loginId, userName: currentUserName } = useAuth();
  const api = useApi();

  const [userData, setUserData] = useState({
    id: loginId || "",
    // 💡 name 필드는 프론트엔드 상태와 서버 요청 바디에 맞춤
    name: currentUserName || "",
    newPassword: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  // 1. ⚙️ 사용자 정보 조회 로직 (GET) - useApi 적용
  const fetchUserData = useCallback(async () => {
    if (!loginId) {
      setIsLoading(false);
      setMessage("로그인 정보가 없습니다.");
      return;
    }

    setIsLoading(true);
    setMessage("사용자 정보를 불러오는 중...");

    try {
      const fetchedData = await api.get(`/api/mypage/profile/${loginId}`);

      setUserData((prev) => ({
        ...prev,
        // 💡 수정: 서버 응답 필드명 'userId'와 'userName'에 맞춥니다.
        id: fetchedData.userId || loginId,
        name: fetchedData.userName || "이름없음",
      }));
      setMessage("정보를 성공적으로 불러왔습니다.");
    } catch (error) {
      console.error("Fetch Error:", error);
      setMessage(`❌ 정보 불러오기 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }, [loginId, api]);

  // 2. 🚀 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // 3. 📝 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // 4. 💾 사용자 정보 수정 요청 로직 (PUT) - useApi 적용
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("수정 요청 중...");

    if (userData.newPassword && userData.newPassword !== confirmPassword) {
      setMessage("❌ 새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    // 💡 수정: 서버가 req.body에서 'userName'을 기대하므로, 필드명을 'userName'으로 변경합니다.
    const updatePayload = {
      userName: userData.name,
      ...(userData.newPassword && { newPassword: userData.newPassword }),
    };

    try {
      await api.put(`/api/mypage/profile/${loginId}`, updatePayload);

      // 성공 처리
      setMessage("✅ 정보가 성공적으로 수정되었습니다!");
      setIsEditing(false);

      // 비밀번호 필드 초기화
      setUserData((prev) => ({ ...prev, newPassword: "" }));
      setConfirmPassword("");
    } catch (error) {
      console.error("Update Error:", error);
      setMessage(`❌ 수정 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
      // 성공적으로 수정했더라도, 비밀번호가 변경되었을 경우 토큰 갱신 로직이 필요할 수 있습니다.
      // (현재 useApi가 토큰 처리를 한다고 가정)
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // 5. 📝 수정 모드 취소 핸들러
  const handleCancel = () => {
    setIsEditing(false);
    // 취소 시, 최신 정보를 다시 불러와 폼을 롤백
    fetchUserData();
    setUserData((prev) => ({ ...prev, newPassword: "" }));
    setConfirmPassword("");
    setMessage("");
  };

  if (isLoading) {
    return <div className="profile-loading">사용자 정보를 불러오는 중...</div>;
  }

  return (
    <div className="profile-page-container">
      <h2>내 정보 수정</h2>
      {message && (
        <p
          className={`status-message ${
            message.startsWith("✅") ? "success" : "error"
          }`}
        >
          {message.replace(/^(✅|❌)/, "").trim()}
        </p>
      )}
      <form onSubmit={handleSubmit} className="profile-form">
        {/* 1. 아이디 (로그인 ID, 수정 불가) */}
        <div className="form-group">
          <label htmlFor="id">아이디</label>
          <div className="input-container">
            <input
              type="text"
              id="id"
              name="id"
              value={userData.id}
              disabled
              className="disabled-input"
            />
          </div>
        </div>

        {/* 2. 사용자 이름 (수정 가능) */}
        <div className="form-group">
          <label htmlFor="name">사용자 이름</label>
          <div className="input-container">
            <input
              type="text"
              id="name"
              name="name"
              value={userData.name}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
            {/* 수정 모드가 아닐 때 '변경' 버튼 표시 */}
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="change-btn"
              >
                변경
              </button>
            )}
          </div>
        </div>

        {/* 3. 새 비밀번호 (수정 모드일 때만 활성화) */}
        <div className="form-group">
          <label htmlFor="newPassword">비밀번호</label>
          <div className="input-container">
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={userData.newPassword}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder={
                isEditing ? "변경할 새 비밀번호를 입력하세요" : "••••••••"
              }
            />
            {/* 💡 수정: 이름 필드와 비밀번호 필드에 중복 버튼이 표시되던 문제를 해결 */}
            {/* 이름 변경은 이름 필드 옆의 버튼으로, 비밀번호 변경은 비밀번호 필드 옆의 버튼으로 시작해야 함 */}
            {/* 현재는 이름 필드 옆의 버튼만 남기고, 비밀번호 필드 옆의 버튼은 제거 */}
          </div>
        </div>

        {/* 4. 새 비밀번호 확인 (수정 모드일 때만 활성화) */}
        {isEditing && (
          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <div className="input-container">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={isEditing}
              />
            </div>
          </div>
        )}

        {/* 5. 수정 버튼 / 저장 버튼 (중앙 하단) */}
        {isEditing && (
          <div className="button-group">
            <button type="submit" disabled={isLoading} className="save-btn">
              {isLoading ? "저장 중..." : "저장"}
            </button>
            <button type="button" onClick={handleCancel} className="cancel-btn">
              취소
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default Profile;
