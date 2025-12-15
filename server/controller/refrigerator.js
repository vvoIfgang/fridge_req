const pool = require("../sql/connDB");
const { spawn } = require("child_process");
const path = require("path");

exports.getIngredient = async (req, res) => {
  const userId = req.user.id;

  let conn;
  try {
    conn = await pool.getConnection();
    const sql = "SELECT * FROM ingredient WHERE userId = ?";
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
    const sql =
      "INSERT INTO ingredient (userId, ingreName, quantity) VALUES (?, ?, ?)";
    const result = await conn.query(sql, [userId, name, quantity]);
    console.log("결과", result);
    const newId = result.insertId.toString();
    res.status(201).json({
      id: Number(newId), // 숫자로 변환해서 전달
      name: name,
      quantity: quantity,
    });
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
    const sql = "DELETE FROM ingredient WHERE id = ? AND userId = ?";
    const result = await conn.query(sql, [ingredientId, userId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "재료를 찾을 수 없거나 권한이 없습니다." });
    }

    res.json({ message: "삭제 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "삭제 에러" });
  } finally {
    if (conn) conn.release();
  }
};

//4. 재료 수정
exports.updateIngredient = async (req, res) => {
  const userId = req.user.id;
  const { id, name, quantity } = req.body; // 수정할 재료 ID와 내용

  let conn;
  try {
    conn = await pool.getConnection();

    // 내 재료인지 확인하고 업데이트
    const sql =
      "UPDATE ingredient SET ingreName = ?, quantity = ? WHERE id = ? AND userId = ?";
    const result = await conn.query(sql, [name, quantity, id, userId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "수정할 재료를 찾지 못했거나 권한이 없습니다." });
    }

    res.json({ message: "수정 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "수정 에러" });
  } finally {
    if (conn) conn.release();
  }
};

exports.analyze = async (req, res) => {
  const { ingredients } = req.body;
  console.log("분석시작함", ingredients);
  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ message: "분석할 재료가 없습니다" });
  }

  try {
    const ingredientString = ingredients.map((i) => i.name).join(",");
    const pythonScriptPath = path.join(__dirname, "../../ai/ai_model.py");
    const pythonProcess = spawn(
      "python",
      [pythonScriptPath, ingredientString],
      {
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      }
    );

    let dataString = "";
    let errorString = "";

    pythonProcess.stdout.on("data", (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorString += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("python error: ", errorString);
        return res.status(500).json({
          status: "error",
          message: "AI 모델 실행 중 오류가 발생했습니다",
        });
      }

      try {
        const jsonStartIndex = dataString.indexOf("{");
        const jsonEndIndex = dataString.lastIndexOf("}");

        if (jsonStartIndex === -1 || jsonEndIndex === -1) {
          throw new Error("JSON 형식을 찾을 수 없습니다.");
        }

        const cleanJsonString = dataString.substring(
          jsonStartIndex,
          jsonEndIndex + 1
        );
        const resultJson = JSON.parse(cleanJsonString);
        if (resultJson.status === "error") {
          console.error("🐍 Python Script Error:", resultJson.message);
          return res.status(500).json({
            status: "error",
            message: "AI 모델 내부 오류",
            details: resultJson.message,
          });
        }
        console.log("✅ 분석 성공:", resultJson.dish_name);
        res.json(resultJson);
      } catch (parseError) {
        console.error(
          "JSON Prase error : ",
          parseError,
          "Raw Data : ",
          dataString
        );
        res.status(500).json({
          status: "error",
          message: "AI 응답을 처리하는데 실패했습니다",
        });
      }
    });
  } catch (err) {
    console.error("Analysis Controller Error:", err);
    res.status(500).json({ message: "서버 내부 에러" });
  }
};

exports.saveRecipe = async (req, res) => {
  const userId = req.user.id;
  const { dish_name, input_ingredients } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      "INSERT INTO recipes (userId,recipeName) VALUES (?, ?)",
      [userId, dish_name]
    );
    const recipeId = result.insertId;

    if (input_ingredients) {
      const ingArray = input_ingredients.split(",").map((s) => s.trim());
      const sqlIng =
        "INSERT INTO recipeIngredients (recipeId,ingredientName) VALUES (?, ?)";

      for (const ingName of ingArray) {
        if (ingName) {
          await conn.query(sqlIng, [recipeId, ingName]);
        }
      }
    }
    res.status(201).json({
      message: "저장 완료",
      recipeId: Number(recipeId),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "저장 실패" });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};
