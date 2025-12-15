const pool = require("../sql/connDB");

// 1. 전체 레시피 목록 조회 (GET /api/recipes/list)
exports.getAllRecipes = async (req, res) => {
  const userId = req.user.id;

  let conn;
  try {
    conn = await pool.getConnection();

    // 💡 수정: 불필요한 JSON 파싱 로직 제거 및 recipeId를 id로 별칭 처리
    // (재료 목록은 목록 조회 시 성능을 위해 제외하거나, 필요하면 JOIN 해야 함. 여기선 기본 정보만 조회)
    const sql = `
      SELECT recipeId as id, userId, recipeName, description, isFavorite 
      FROM recipes 
      WHERE userId = ? 
      ORDER BY recipeId DESC
    `;

    const rows = await conn.query(sql, [userId]);

    // 프론트엔드 호환성을 위한 간단한 매핑
    const parsedRows = rows.map((row) => ({
      ...row,
      dish_name: row.recipeName, // 프론트엔드 호환용
      // ingredients나 meta_info는 DB에 없으므로 빈 값 처리
      ingredients: { main: [] },
      meta_info: {},
    }));

    res.json(parsedRows);
  } catch (err) {
    console.error("레시피 목록 조회 실패:", err);
    res.status(500).json({ message: "목록 조회 실패" });
  } finally {
    if (conn) conn.release();
  }
};

// 2. 선호 레시피 추가 (POST /api/recipes/add-favorite)
exports.addFavorite = async (req, res) => {
  const userId = req.user.id;
  // 프론트엔드에서 보내주는 데이터 (meta_info 등 불필요한건 무시)
  const { dish_name, description, ingredients } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();

    // 1️⃣ 레시피 기본 정보 저장 (recipes 테이블)
    const sqlRecipe = `
      INSERT INTO recipes (userId, recipeName, description, isFavorite) 
      VALUES (?, ?, ?, 1)
    `;

    const result = await conn.query(sqlRecipe, [
      userId,
      dish_name,
      description,
    ]);

    const newRecipeId = result.insertId; // 방금 생성된 레시피 ID

    // 2️⃣ 재료 목록 저장 (recipeIngredients 테이블 - 정규화)
    // ingredients.main 배열이 있을 경우에만 실행
    if (ingredients && ingredients.main && Array.isArray(ingredients.main)) {
      const sqlIng =
        "INSERT INTO recipeIngredients (recipeId, ingredientName) VALUES (?, ?)";

      for (const ingName of ingredients.main) {
        if (ingName) {
          await conn.query(sqlIng, [newRecipeId, ingName]);
        }
      }
    }

    res.json({
      message: "선호 레시피 추가 성공",
      recipeId: Number(newRecipeId),
    });
  } catch (err) {
    console.error("선호 레시피 추가 실패:", err);
    res.status(500).json({ message: "추가 실패" });
  } finally {
    if (conn) conn.release();
  }
};

// 3. 선호 레시피 목록 조회 (GET /api/recipes/favorites)
exports.getFavorites = async (req, res) => {
  const userId = req.user.id;

  let conn;
  try {
    conn = await pool.getConnection();

    // isFavorite가 1인(True) 항목만 조회
    const sql = `
      SELECT recipeId as id, recipeName, description 
      FROM recipes 
      WHERE userId = ? AND isFavorite = 1
      ORDER BY recipeId DESC
    `;

    const rows = await conn.query(sql, [userId]);

    const parsedRows = rows.map((row) => ({
      ...row,
      dish_name: row.recipeName,
      ingredients: { main: [] }, // 목록에선 상세 재료 생략 (필요 시 별도 조회 구현)
      meta_info: {},
    }));

    res.json(parsedRows);
  } catch (err) {
    console.error("선호 목록 조회 실패:", err);
    res.status(500).json({ message: "선호 목록 조회 실패" });
  } finally {
    if (conn) conn.release();
  }
};

// 4. 선호 레시피 삭제 (DELETE /api/recipes/favorites/:id)
exports.deleteFavorite = async (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.id;

  let conn;
  try {
    conn = await pool.getConnection();

    // 💡 수정: WHERE 조건절 컬럼명을 id -> recipeId로 변경
    // ON DELETE CASCADE 설정 덕분에 recipeIngredients는 자동 삭제됨
    const sql = "DELETE FROM recipes WHERE recipeId = ? AND userId = ?";
    await conn.query(sql, [recipeId, userId]);

    res.json({ message: "삭제 성공" });
  } catch (err) {
    console.error("삭제 실패:", err);
    res.status(500).json({ message: "삭제 실패" });
  } finally {
    if (conn) conn.release();
  }
};
