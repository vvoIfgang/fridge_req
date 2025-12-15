const pool = require("../sql/connDB");
const { spawn, spawnSync } = require("child_process");
const path = require("path");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GeminiApiKey);
const youtubeApiKey = process.env.youtubeApikey;

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
    //promise로 비동기 처리
    const runPythonModel = () => {
      return new Promise((resolve, reject) => {
        const pythonProcess = spawn(
          "python",
          [pythonScriptPath, ingredientString],
          {
            //윈도우에서 한글 깨짐 방지
            env: { ...process.env, PYTHONIOENCODING: "utf-8" },
            cwd: path.join(__dirname, "../../ai"),
          }
        );

        let dataString = ""; // 파이썬이 뱉는 정상 데이터(print)를 모을 변수
        let errorString = ""; // 파이썬이 뱉는 에러 로그를 모을 변수

        // 이벤트 리스너 (.on)
        // 'data': 파이썬이 뭔가를 출력할 때마다 발생
        pythonProcess.stdout.on(
          "data",
          (data) => (dataString += data.toString())
        );
        pythonProcess.stderr.on(
          "data",
          (data) => (errorString += data.toString())
        );

        // 'close': 파이썬 프로그램이 종료되었을 때 발생
        pythonProcess.on("close", (code) => {
          // code !== 0: 비정상 종료 (에러)
          if (code !== 0) {
            console.error("Python Error:", errorString);
            // reject: Promise를 실패로 처리하고 에러를 던짐 (catch로 이동)
            return reject(new Error("AI 모델 실행 실패"));
          }
          try {
            const jsonStartIndex = dataString.indexOf("{");
            const jsonEndIndex = dataString.lastIndexOf("}");

            if (jsonStartIndex === -1)
              return reject(new Error("Python Output Not JSON"));

            const cleanJson = dataString.substring(
              jsonStartIndex,
              jsonEndIndex + 1
            );

            // resolve: Promise를 성공으로 처리하고 결과를 반환)
            resolve(JSON.parse(cleanJson));
          } catch (e) {
            reject(e);
          }
        });
      });
    };

    console.log("Python 모델 실행 중...");

    // await: 위에서 만든 runPythonModel 함수가 끝날 때까지(resolve될 때까지) 기다립니다.
    const pythonResult = await runPythonModel();

    const dishName = pythonResult.dish_name || "추천 요리";
    console.log(`Python 추천 결과: [${dishName}]`);

    console.log(`YouTube에서 [${dishName} 레시피] 검색 중...`);

    let youtubeData = {
      description: "", //영상 설명
      videoTitle: dishName,
      thumbnail: "",
      videoId: "",
    };

    if (youtubeApiKey) {
      try {
        const searchQuery = `${dishName} 만드는법`;

        const params = new URLSearchParams({
          part: "snippet",
          q: searchQuery,
          key: youtubeApiKey,
          maxResults: 1,
          type: "video",
          regionCode: "KR",
          relevanceLanguage: "ko",
        });

        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?${params}`
        );
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          youtubeData = {
            videoId: item.id.videoId,
            videoTitle: item.snippet.title,
            description: item.snippet.description,
            thumbnail:
              item.snippet.thumbnails?.high?.url ||
              item.snippet.thumbnails?.default?.url,
          };
          console.log("YouTube 데이터 확보 완료");
        }
      } catch (ytError) {
        console.error("YouTube API Error:", ytError);
      }
    }

    console.log("Gemini 레시피 작성 실행");
    let finalDescription = "";
    try {
      const prompt = `
        너는 요리 레시피 데이터베이스야. 
        사용자에게 감정적인 위로나 인사말(예: "안녕하세요", "피곤하시죠", "이해합니다" 등)은 **절대 하지 마.**
        오직 아래 정보를 바탕으로 '${dishName}'의 **조리 과정**만 바로 서술해.

        [기본 정보]
        - 요리 이름: ${dishName}
        - 재료: ${ingredientString}
        - 참고 영상 제목: ${youtubeData.videoTitle}
        - 참고 영상 설명: ${youtubeData.description}

        [작성 규칙]
        1. 서론, 본론, 결론 형식을 버리고 **즉시 조리법부터 시작**할 것.
        2. 유튜브 영상 내용을 참고하여 구체적인 조리 순서를 서술형으로 작성.
        3. 문체는 "~하세요", "~합니다"체의 정중한 존댓말 사용.
        4. (중요) **조리법 외의 사족은 전부 제거할 것.**
      `;
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      finalDescription = response.text();
      console.log("gemini 레시피 작성 완료");
    } catch (geminiError) {
      console.error("gemini Error : ", geminiError);
    }
    // 응답 전송
    const finalResult = {
      status: "success",
      dish_name: dishName,
      description: finalDescription,
      meta_info: {
        video_id: youtubeData.videoId,
        thumbnail: youtubeData.thumbnail,
      },
      input_ingredients: ingredientString,
      ingredients: {
        main: ingredients.map((i) => i.name),
      },
    };
    console.log("최종 결과 전송 완료");
    res.json(finalResult);
  } catch (err) {
    console.error("Analyze Controller Error:", err);
    res.status(500).json({
      status: "error",
      message: "분석 중 오류 발생",
      details: err.message,
    });
  }
};

exports.saveRecipe = async (req, res) => {
  const userId = req.user.id;
  const { dish_name, input_ingredients, description } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      "INSERT INTO recipes (userId,recipeName,description) VALUES (?, ?, ?)",
      [userId, dish_name, description]
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
