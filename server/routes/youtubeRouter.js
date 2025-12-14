const express = require("express");
const router = require("express").Router();
require("dotenv").config();

const youtubeApiKey = process.env.youtubeApiKey;
const youtubeSeachUrl = "https://www.googleapis.com/youtube/v3/search";

router.get("/search", async (req, res) => {
  //destructuring assignment
  const { query, count } = req.query; //프론트에서 보낸 검색어와 개수

  if (!query) {
    return res.status(400).json({ message: "검색어가 필요합니다." });
  }

  try {
    //쿼리 스트링을 쉽게 만들어줌 (urlsearchparams)
    const params = new URLSearchParams({
      part: "snippet",
      q: `${query} 요리법`,
      key: youtubeApiKey,
      maxResults: count,
      type: "video",
      regionCode: "KR",
    });

    const url = `${youtubeSeachUrl}?${params.toString()}`; // optional chaining
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      //response가 200~299 즉, 성공적으로 반환됐을때 true를 반환함
      console.error("youtube api error : ", data);
      return res.status(response.status).json({ message: "유튜브 검색 실패" });
    }

    //id, 제목, 썸네일 추출
    const videoData = data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.default?.url,
      link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    res.json(videoData);
  } catch (error) {
    console.error("Serer error : ", error);
    res.status(500).json({ message: "서버 에러 발생" });
  }
});

module.exports = router;
