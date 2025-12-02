//토큰 검사 미들웨어

const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; //서버에서 토큰을 보낼때 bearer공백어쩌구저쩌구형식으로 보냄 그래서 앞에 부분은 거르고 뒤에있는 부분만 쓰기위해 이런식의 코드를짬
  if (!token) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  jwt.verify(token, process.env.secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
    }
    req.user = user;
    next(); // 다음 단계(Controller)로 통과
  });
};
