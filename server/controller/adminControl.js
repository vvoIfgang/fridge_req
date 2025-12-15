// server/controller/adminControl.js
const pool = require("../sql/connDB");

// 1. 전체 사용자 목록 조회 (UserList.js)
// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    // 비밀번호 제외하고 조회
    const sql = "SELECT id, userId, userName, role, status FROM userinfo";
    const rows = await conn.query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "목록 조회 실패" });
  } finally {
    if (conn) conn.release();
  }
};

// 2. 사용자 상세 검색 (UserDetail.js, UserSign.js)
// GET /api/admin/users/detail?userName=...
exports.getUserDetail = async (req, res) => {
  const { userName } = req.query; // 쿼리 파라미터에서 이름 가져오기

  let conn;
  try {
    conn = await pool.getConnection();
    // 이름으로 검색 (비밀번호 제외)
    const sql = "SELECT id, userId, userName, role, status FROM userinfo WHERE userName = ?";
    const rows = await conn.query(sql, [userName]);

    if (rows.length === 0) {
      // 200 OK를 보내되, 내용은 비워둠 (프론트 로직에 맞춤)
      return res.json(null); 
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "검색 실패" });
  } finally {
    if (conn) conn.release();
  }
};

// 3. 사용자 계정 상태 변경 (UserSign.js)
// PUT /api/admin/users/status
exports.updateUserStatus = async (req, res) => {
  const { id, newStatus } = req.body; // DB Primary Key(id) 사용

  let conn;
  try {
    conn = await pool.getConnection();
    
    // 관리자 자신(현재 로그인한 사람)은 정지시킬 수 없게 막기
    if (req.user.id == id) {
        return res.status(400).json({ message: "자기 자신의 계정은 변경할 수 없습니다." });
    }

    const sql = "UPDATE userinfo SET status = ? WHERE id = ?";
    await conn.query(sql, [newStatus, id]);

    res.json({ message: "상태 변경 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "상태 변경 실패" });
  } finally {
    if (conn) conn.release();
  }
};

// 4. 사용자 계정 삭제 (UserSign.js)
// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  const targetId = req.params.id; // URL 파라미터에서 ID 가져오기

  let conn;
  try {
    conn = await pool.getConnection();

    if (req.user.id == targetId) {
        return res.status(400).json({ message: "자기 자신은 삭제할 수 없습니다." });
    }

    const sql = "DELETE FROM userinfo WHERE id = ?";
    await conn.query(sql, [targetId]);

    res.json({ message: "삭제 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "삭제 실패" });
  } finally {
    if (conn) conn.release();
  }
};