const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../sql/connDB");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GeminiApiKey);

exports.chatbot = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  console.log("챗봇 호출");

  try {
    let ingredientList = "";
    const conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT ingreName FROM ingredient WHERE userId = ?",
      [userId]
    );
    if (rows.length > 0) {
      ingredientList = rows.map((row) => row.ingreName).join(",");
    } else {
      ingredientList = "냉장고가 비어있음";
    }
  } catch (dbErr) {
    console.error("DB error : ", dbErr);
  } finally {
    conn.release();
  }
  const prompt = `
      너는 창의적이고 친절한 전문 셰프야.
      
      [사용자 상황]
      - 사용자의 냉장고에 있는 재료: ${ingredientList}
      - 사용자의 요구사항/선호도: "${message}"
      
      [명령]
      1. 사용자의 요구사항에 맞으면서, 가능한 냉장고에 있는 재료를 활용할 수 있는 '이국적이거나 특별한 레시피' 1가지를 추천해줘.
      2. 만약 냉장고 재료로 부족하다면, 필요한 추가 재료를 알려줘.
      3. 답변은 줄글 형태의 친절한 대화체로 작성해줘. (예: "매운 맛을 원하시는군요! 그럼 냉장고에 있는 닭고기를 활용해서...")
      4. 너무 길지 않게 핵심 레시피와 팁을 포함해줘.
    `;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  console.log("챗봇 입력 완료");

  res.json({ response: text });
  if (err) {
    console.error("챗봇 에러 : ", err);
    res.status(500).json({ error: "챗봇이 응답을 생성하는 중 문제가 발생함" });
  }
};
