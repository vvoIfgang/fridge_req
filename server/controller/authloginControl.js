const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../sql/connDB");
require("dotenv").config();
const secretKey = process.env.secretKey;
const refreshSecretKey = process.env.refreshSecretKey;

//회원 가입
exports.register = async (req, res) => {
  console.log("register 실행됨!");
  const { userId, userPw, userName } = req.body; //유저 입력 데이터 가져옴
  let conn;

  try {
    conn = await pool.getConnection(); //db 연결
    console.log("db연결됨!");
    //아이디 중복 검사
    const checkResult = await conn.query(
      "SELECT * FROM userinfo WHERE userID = ?",
      [userId]
    );
    if (checkResult.length > 0) {
      return res.status(409).json({ message: "이미 존재하는 아이디입니다." });
    }
    // 비밀번호 암호화 후 저장
    const hashedPassword = await bcrypt.hash(userPw, 10);
    conn.query(
      "INSERT INTO userinfo (userID,userPw,userName) VALUES (?, ?, ?)",
      [userId, hashedPassword, userName]
    );
    res.status(201).json({ message: "회원가입 완료!" });
  } catch (err) {
    //예외처리
    console.error(err);
    res.status(500).json({ message: "서버 에러" });
  } finally {
    if (conn) {
      conn.release(); //커넥션 반환
    }
  }
};

exports.login = async (req, res) => {
  const { userId, userPw } = req.body;
  let conn;
  console.log("로그인 실행됨!");
  try {
    conn = await pool.getConnection();
    const checkId = await conn.query(
      "SELECT * FROM userinfo WHERE userId = ?",
      [userId]
    );
    if (checkId.length == 0) {
      return res.status(401).json({ message: "id 입력 오류" });
    }
    const user = checkId[0];
    const comparePw = await bcrypt.compare(userPw, user.userPw);
    if (!comparePw) {
      return res.status(401).json({ message: "비밀번호가 틀렸습니다." });
    }
    //비밀번호가 맞을 경우 토큰 발급해줌
    const accessToken = jwt.sign(
      { id: user.id, userId: user.userId, role: user.role },
      secretKey,
      { expiresIn: "1h" } // 유효기간
    ); //access Token임
    const refreshToken = jwt.sign({ id: user.id }, refreshSecretKey, {
      expiresIn: "14d",
    });
    await conn.query("INSERT INTO refreshToken (userId,token) VALUES (?, ?)", [
      user.id,
      refreshToken,
    ]);
    //클라이언트에 토큰 전달
    res.status(200).json({
      message: "로그인 성공",
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: { name: user.userName, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 에러" });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};
//리프레시 토큰
exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "토큰이 없습니다" });
  }
  let conn;
  try {
    conn = await pool.getConnection();

    const checkRefresh = await conn.query(
      "SELECT * FROM refreshToken WHERE token = ?",
      [refreshToken]
    );
    if (checkRefresh.length === 0) {
      return res.status(403).json({ message: "유효하지 않은 토큰입니다" });
    }
    //토큰 위조/만료 검사
    jwt.verify(refreshToken, refreshSecretKey, async (err, decoded) => {
      //verify가 refreshToken과 refreshSecretKey를 읽고 유효하다면 err에 null값을 반환함
      if (err) {
        return res.status(403).json({ message: "만료된 토큰입니다." });
      }
      const ReCheck = await conn.query("SELECT * FROM userinfo WHERE id = ?", [
        decoded.id,
      ]);
      const user = ReCheck[0];
      const newAccessToken = jwt.sign(
        { userId: user.userId, role: user.role },
        secretKey,
        { expiresIn: "1h" }
      );
      //다했으니까 새 토큰 전달하기
      res.json({
        accessToken: newAccessToken,
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 에러" });
  } finally {
    if (conn) conn.release();
  }
};

//로그아웃
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query("DELETE FROM refreshToken WHERE token = ?", [
      refreshToken,
    ]);
    res.json({ message: "로그아웃 성공" });
  } catch (err) {
    res.status(500).json({ message: "에러 발생" });
  } finally {
    if (conn) conn.release();
  }
};
