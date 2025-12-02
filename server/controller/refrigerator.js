const pool = require('../sql/connDB');

exports.getIngredient = async (req , res) => {
    const userId = req.user.id; 

    let conn;
    try {
        conn = await pool.getConnection();
        const sql = "SELECT * FROM ingredients WHERE user_id = ?";
        const rows = await conn.query(sql, [userId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 에러" });
    } finally {
        if (conn) {
            conn.release();
        }
    }
};

// 2. 재료 추가
exports.addIngredient = async (req, res) => {
    const userId = req.user.id;
    const { name, quantity, category } = req.body;

    let conn;
    try {
        conn = await pool.getConnection();
        const sql = "INSERT INTO ingredient (userId, name, quantity) VALUES (?, ?, ?)";
        await conn.query(sql, [userId, name, quantity]);
        
        res.status(201).json({ message: "재료 추가 성공" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "재료 추가 실패" });
    } finally {
        if (conn) conn.release();
    }
};

// 3. 재료 삭제
exports.deleteIngredient = async (req, res) => {
    const userId = req.user.id;
    const ingredientId = req.params.id;

    let conn;
    try {
        conn = await pool.getConnection();
        // 내 재료가 맞는지 확인하고 삭제 (보안)
        const sql = "DELETE FROM ingredient WHERE id = ? AND user_id = ?";
        const result = await conn.query(sql, [ingredientId, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "재료를 찾을 수 없거나 권한이 없습니다." });
        }
        
        res.json({ message: "삭제 성공" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "삭제 에러" });
    } finally {
        if (conn) conn.release();
    }
}