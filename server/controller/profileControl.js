// server/controller/profileControl.js
const pool = require("../sql/connDB");
const bcrypt = require("bcrypt");

// 1. 프로필 조회 (토큰 기반으로 수정하여 에러 해결)
exports.getProfile = async (req, res) => {
  const userId = req.user.userId;

  let conn;
  try {
    conn = await pool.getConnection();
    const sql = "SELECT userId, userName, role FROM userinfo WHERE userId = ?";
    const rows = await conn.query(sql, [userId]);

    if (rows.length === 0)
      return res.status(404).json({ message: "사용자 없음" });

    res.json({
      userId: rows[0].userId,
      userName: rows[0].userName,
      role: rows[0].role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 에러" });
  } finally {
    if (conn) conn.release();
  }
};

// 2. 프로필 수정
exports.updateProfile = async (req, res) => {
  // 💡 수정: 수정할 대상도 토큰의 ID를 기준
  const userId = req.user.userId;
  const { userName, newPassword } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await conn.query(
        "UPDATE userinfo SET userName = ?, userPw = ? WHERE userId = ?",
        [userName, hashedPassword, userId]
      );
    } else {
      await conn.query("UPDATE userinfo SET userName = ? WHERE userId = ?", [
        userName,
        userId,
      ]);
    }

    res.json({ message: "수정 완료" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "수정 에러" });
  } finally {
    if (conn) conn.release();
  }
};
