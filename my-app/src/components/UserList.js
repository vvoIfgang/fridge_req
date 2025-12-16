// components/UserList.jsx
import React, { useState, useEffect, useCallback } from "react";
import useApi from "../hook/useApi"; // 🔑 실제 API 훅 사용 유지
import { useAuth } from "../context/AuthContext";
// import UserSign from "./UserSign"; // ❌ UserSign 컴포넌트 import 제거
import "../css/UserList.css"; // Admin.css 대신 UserList.css 사용 가정

const UserList = () => {
  const api = useApi();
  const { userRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  // DB에서 사용자 목록을 가져오는 함수 (실제 API 호출)
  const fetchUsers = useCallback(async () => {
    if (userRole !== "admin") {
      setMessage("❌ 접근 권한이 없습니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 💡 API 명세: GET /api/admin/users
      const response = await api.get("/api/admin/users");
      setUsers(response || []);
      setMessage("✅ 사용자 목록을 성공적으로 불러왔습니다.");
    } catch (error) {
      console.error("Fetch User List Error:", error);
      setMessage(`❌ 사용자 목록 로드 실패: ${error.message}`);
      setUsers([]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }, [api, userRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ✨ 사용자 목록 업데이트 함수 (목록 새로 고침)
  const handleUserUpdate = () => {
    setMessage("♻️ 사용자 목록을 새로고침합니다...");
    fetchUsers();
  };

  if (isLoading) {
    return <div className="admin-loading">사용자 목록을 불러오는 중...</div>;
  }

  if (userRole !== "admin") {
    return (
      <div className="admin-access-denied">❌ 관리자 권한이 필요합니다.</div>
    );
  }

  return (
    <div className="admin-section">
      <div className="user-list-header">
        <h3>사용자 목록 조회</h3>
        {/* ⭐ 목록 새로 고침 버튼 유지 ⭐ */}
        <button
          onClick={handleUserUpdate}
          disabled={isLoading}
          className="refresh-list-btn"
        >
          {isLoading ? "새로고침 중..." : "🔄 목록 새로 고침"}
        </button>
      </div>

      {message && <p className="status-message">{message}</p>}

      <div className="user-list-container">
        <table>
          <thead>
            <tr>
              <th>DB ID</th>
              <th>사용자 ID</th>
              <th>사용자 이름</th>
              <th>현재 역할</th>
              <th>상태</th>
              <th>가입일</th>
              <th>최근 로그인</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                {/* colSpan을 5로 설정 */}
                <td colSpan="7">등록된 사용자가 없습니다.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.userId}</td>
                  <td>{user.userName}</td>
                  <td>{user.role}</td>
                  <td>{user.status || "활성"}</td>
                  <td>{user.created_at}</td>
                  <td>{user.last_login}</td>
                  {/* ❌ '가입일' 및 '관리 액션' 데이터 렌더링 제거됨 */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
