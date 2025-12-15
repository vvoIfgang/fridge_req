// components/AccountManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import useApi from "../hook/useApi";
import { useAuth } from "../context/AuthContext";
import "../css/UserSign.css"; // 스타일 파일 필요 가정

const AccountManagement = () => {
  const api = useApi();
  const { userRole } = useAuth();

  // 1. 검색 및 사용자 정보 상태
  const [searchName, setSearchName] = useState("");
  const [user, setUser] = useState(null); // 검색된 사용자 상세 정보

  // 2. UI 및 통신 상태
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchExecuted, setSearchExecuted] = useState(false);

  // 🔑 1. 사용자 이름으로 상세 정보 검색 로직
  const handleSearchUser = useCallback(
    async (e) => {
      e.preventDefault();

      if (userRole !== "admin") {
        setMessage("❌ 관리자 권한이 필요합니다.");
        return;
      }

      const trimmedSearchName = searchName.trim();
      if (!trimmedSearchName) {
        setMessage("⚠️ 검색할 사용자 이름을 입력해 주세요.");
        setUser(null);
        setSearchExecuted(false);
        return;
      }

      setIsLoading(true);
      setSearchExecuted(true);
      setMessage(`'${trimmedSearchName}' 사용자 정보 검색 중...`);
      setUser(null); // 새로운 검색 시작 시 이전 정보 초기화

      try {
        // 💡 API 명세: GET /api/admin/users/detail?userName={searchName} (UserDetail과 동일 API 사용 가정)
        const response = await api.get(
          `/api/admin/users/detail?userName=${trimmedSearchName}`
        );

        if (response && response.userId) {
          // user.status 필드를 기본값 'active'로 설정
          setUser({ ...response, status: response.status || "active" });
          setMessage(
            `✅ '${trimmedSearchName}' 사용자 정보를 성공적으로 불러왔습니다.`
          );
        } else {
          setMessage(`⚠️ 사용자 '${trimmedSearchName}'를 찾을 수 없습니다.`);
        }
      } catch (error) {
        console.error("User Search Error:", error);
        setMessage(`❌ 사용자 검색 실패: ${error.message}`);
      } finally {
        setIsLoading(false);
        setTimeout(() => setMessage(""), 5000);
      }
    },
    [api, userRole, searchName]
  );

  // 🔑 2. 계정 정지/활성 상태 변경 로직
  const handleToggleStatus = async () => {
    if (!user) return;

    const newStatus = user.status === "active" ? "deactivated" : "active";
    const action = newStatus === "deactivated" ? "정지" : "활성";

    if (
      !window.confirm(
        `'${user.userName}' 계정을 ${action} 상태로 변경하시겠습니까?`
      )
    ) {
      return;
    }

    setIsLoading(true);
    setMessage(`계정 ${action} 요청 중...`);

    try {
      // 💡 API 명세: PUT /api/admin/users/status
      await api.put("/api/admin/users/status", {
        id: user.id, // DB PK
        newStatus: newStatus,
      });

      // 상태 업데이트 (프론트엔드 즉시 반영)
      setUser((prev) => ({ ...prev, status: newStatus }));
      setMessage(`✅ '${user.userName}' 계정이 ${action}되었습니다.`);
    } catch (error) {
      console.error("Status Change Error:", error);
      setMessage(`❌ 계정 ${action} 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // 🔑 3. 계정 삭제 로직
  const handleDeleteUser = async () => {
    if (!user) return;

    if (
      !window.confirm(
        `경고: '${user.userName}' 계정(ID: ${user.id})을 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    setIsLoading(true);
    setMessage("계정 삭제 요청 중...");

    try {
      // 💡 API 명세: DELETE /api/admin/users/:id
      await api.delete(`/api/admin/users/${user.id}`);

      // 상태 초기화
      setUser(null);
      setSearchExecuted(false);
      setMessage(`✅ '${user.userName}' 계정이 영구 삭제되었습니다.`);
    } catch (error) {
      console.error("Delete User Error:", error);
      setMessage(`❌ 계정 삭제 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (userRole !== "admin") {
    return (
      <div className="admin-access-denied">❌ 관리자 권한이 필요합니다.</div>
    );
  }

  return (
    <div className="admin-section account-management">
      <h3>사용자 계정 검색 및 관리</h3>
      {message && (
        <p
          className={`status-message ${
            message.includes("❌")
              ? "error"
              : message.includes("✅")
              ? "success"
              : "info"
          }`}
        >
          {message}
        </p>
      )}

      {/* 2. 검색 폼 */}
      <form onSubmit={handleSearchUser} className="user-search-form">
        <input
          type="text"
          placeholder="관리할 사용자 이름 (userName)을 입력하세요"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          disabled={isLoading}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "검색 중..." : "사용자 검색"}
        </button>
      </form>

      <hr />

      {/* 3. 검색 결과 및 액션 영역 */}
      {searchExecuted && !isLoading && (
        <div className="search-result-area">
          {user ? (
            <div className="detail-card">
              <h4>[{user.userName}] 계정 관리</h4>
              <table>
                <tbody>
                  <tr>
                    <th>DB ID</th>
                    <td>{user.id}</td>
                  </tr>
                  <tr>
                    <th>사용자 ID (로그인)</th>
                    <td>{user.userId}</td>
                  </tr>
                  <tr>
                    <th>사용자 이름</th>
                    <td>{user.userName}</td>
                  </tr>
                  <tr>
                    <th>역할(Role)</th>
                    <td>{user.role}</td>
                  </tr>
                  <tr>
                    <th>가입일</th>
                    <td>{user.created_at}</td>
                  </tr>
                  <tr>
                    <th>최근 로그인</th>
                    <td>{user.last_login}</td>
                  </tr>
                  <tr>
                    <th>계정 상태</th>
                    <td
                      className={
                        user.status === "deactivated"
                          ? "status-deactivated"
                          : "status-active"
                      }
                    >
                      <strong>
                        {user.status === "deactivated"
                          ? "정지됨 (Deactivated)"
                          : "활성 (Active)"}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="action-buttons-group">
                {/* 계정 정지/활성 버튼 */}
                <button
                  onClick={handleToggleStatus}
                  className={
                    user.status === "active" ? "deactivate-btn" : "activate-btn"
                  }
                  disabled={isLoading}
                >
                  {user.status === "active" ? "계정 정지" : "계정 활성"}
                </button>

                {/* 계정 삭제 버튼 */}
                <button
                  onClick={handleDeleteUser}
                  className="delete-btn"
                  disabled={isLoading}
                >
                  계정 삭제 (영구)
                </button>
              </div>
            </div>
          ) : (
            searchName.trim() && (
              <p className="status-message info-no-border">
                입력하신 이름 '{searchName}'에 해당하는 사용자를 찾을 수
                없습니다.
              </p>
            )
          )}
        </div>
      )}

      {!searchExecuted && (
        <p className="status-message info-no-border">
          사용자 이름을 검색하여 계정을 관리하세요.
        </p>
      )}
    </div>
  );
};

export default AccountManagement;
