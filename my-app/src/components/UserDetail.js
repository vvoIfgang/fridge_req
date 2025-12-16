// components/UserDetail.jsx
import React, { useState, useEffect, useCallback } from "react";
import useApi from "../hook/useApi";
import { useAuth } from "../context/AuthContext";
// import { useParams } from 'react-router-dom'; // 라우팅 시 사용 (현재는 가정)
import "../css/UserDetail.css"; // 스타일 파일 필요 가정

// 기존 UserDetail 컴포넌트를 검색 기능에 맞게 수정
const UserDetail = () => {
  const api = useApi();
  const { userRole } = useAuth();

  // 1. 검색 관련 상태
  const [searchName, setSearchName] = useState(""); // 사용자가 입력한 검색 이름
  const [searchExecuted, setSearchExecuted] = useState(false); // 검색이 실행되었는지 여부

  // 2. 조회된 사용자 상세 정보 상태
  const [user, setUser] = useState(null);

  // 3. UI 및 통신 상태
  const [isLoading, setIsLoading] = useState(false); // 검색 로딩 상태
  const [message, setMessage] = useState("");

  // 관리자 권한 확인 (컴포넌트 로드 시 한 번만 확인)
  useEffect(() => {
    if (userRole !== "admin") {
      setMessage("❌ 접근 권한이 없습니다.");
    }
  }, [userRole]);

  // 🔑 1. 사용자 이름으로 상세 정보 검색 로직 (GET)
  const handleSearchUser = useCallback(
    async (e) => {
      e.preventDefault(); // 폼 제출 기본 동작 방지

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
        // 💡 API 명세: GET /api/admin/users/detail?userName={searchName}
        // 백엔드에서 userName 쿼리 파라미터를 받아 DB를 검색한다고 가정
        const response = await api.get(
          `/api/admin/users/detail?userName=${trimmedSearchName}`
        );

        if (response && response.userId) {
          setUser(response); // 사용자 정보가 발견됨
          setMessage(
            `✅ '${trimmedSearchName}' 사용자 정보를 성공적으로 불러왔습니다.`
          );
        } else {
          setUser(null); // 사용자 정보를 찾을 수 없음
          setMessage(`⚠️ 사용자 '${trimmedSearchName}'를 찾을 수 없습니다.`);
        }
      } catch (error) {
        console.error("User Search Error:", error);
        setMessage(`❌ 사용자 검색 실패: ${error.message}`);
        setUser(null);
      } finally {
        setIsLoading(false);
        setTimeout(() => setMessage(""), 5000);
      }
    },
    [api, userRole, searchName]
  );

  if (userRole !== "admin") {
    return (
      <div className="admin-access-denied">❌ 관리자 권한이 필요합니다.</div>
    );
  }

  return (
    <div className="admin-section user-detail">
      <h3>사용자 상세 정보 조회 및 검색</h3>
      {message && <p className="status-message">{message}</p>}

      {/* 2. 검색 폼 */}
      <form onSubmit={handleSearchUser} className="user-search-form">
        <input
          type="text"
          placeholder="검색할 사용자 이름 (userName)을 입력하세요"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          disabled={isLoading}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "검색 중..." : "검색"}
        </button>
      </form>

      <hr />

      {/* 3. 검색 결과 표시 영역 */}
      {searchExecuted && !isLoading && (
        <div className="search-result-area">
          {user ? (
            <div className="detail-card">
              <h4>[{user.userName}] 상세 정보</h4>
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
                    <th>계정 상태</th>
                    <td>{user.status || "활성"}</td>
                  </tr>
                  <tr>
                    <th>가입일</th>
                    <td>{user.created_at}</td>
                  </tr>
                  <tr>
                    <th>최근 로그인</th>
                    <td>{user.last_login}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            searchName.trim() && (
              <p className="status-message info-no-border">
                입력하신 이름 '{searchName}'에 해당하는 사용자 정보를 찾을 수
                없습니다.
              </p>
            )
          )}
        </div>
      )}

      {!searchExecuted && (
        <p className="status-message info-no-border">
          사용자 이름을 검색하여 상세 정보를 확인하세요.
        </p>
      )}
    </div>
  );
};

export default UserDetail;
