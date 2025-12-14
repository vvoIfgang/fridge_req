import React, { useState, useEffect, useCallback } from "react";

// 실제 API 키가 없을 때의 Mock 썸네일 생성 함수
const getThumbnailUrl = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/default.jpg`;
};

function YouTube({ recipeName, videoCount }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    // 1. 유효성 검사: API 키 검사는 이제 백엔드가 하므로 프론트에서는 뺍니다.
    if (!recipeName || videoCount === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // 2. 백엔드 프록시 API로 요청 (검색어와 개수만 보냄)
      // params 변수 만드는 과정이 필요 없어졌습니다.
      const response = await fetch(
        `/api/youtube/search?query=${encodeURIComponent(
          recipeName
        )}&count=${videoCount}`
      );

      const videoData = await response.json();

      setVideos(videoData);
    } catch (error) {
      console.error("YouTube API 통신 오류:", error);

      // 🚨 오류 발생 시 Mock 데이터로 대체
      const searchQuery = `${recipeName} 요리법`;
      const mockData = Array.from({ length: videoCount }, (_, i) => ({
        id: `${recipeName.slice(0, 5)}-mock-${i}`,
        title: `[Mock] ${recipeName} 요리법 #${i + 1}`,
        link: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          searchQuery
        )}`,
        thumbnail: `https://via.placeholder.com/120x90?text=${recipeName.slice(
          0,
          3
        )}+Mock+${i + 1}`,
      }));
      setVideos(mockData);
    } finally {
      setLoading(false);
    }
  }, [recipeName, videoCount]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // ... (아래 렌더링 부분은 수정할 필요 없이 그대로 두시면 됩니다) ...

  if (loading) {
    return (
      <div style={{ color: "#aaa", fontSize: "0.8em", textAlign: "center" }}>
        영상 검색 중...
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div style={{ color: "#aaa", fontSize: "0.8em", textAlign: "center" }}>
        연관 영상 없음
      </div>
    );
  }

  // A. 요약 뷰 (썸네일만 크게 - videoCount = 1)
  if (videoCount === 1) {
    const video = videos[0];
    return (
      <a
        href={video.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "block", width: "100%", height: "100%" }}
      >
        <img
          src={video.thumbnail}
          alt={`${video.title} 썸네일`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/150x84?text=No+Image";
          }}
        />
      </a>
    );
  }

  // B. 상세 뷰 (썸네일 + 제목 목록 - videoCount = 3)
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "100%",
      }}
    >
      {videos.map((video, index) => (
        <div
          key={video.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            borderBottom:
              index < videos.length - 1 ? "1px dotted #eee" : "none",
            paddingBottom: "3px",
          }}
        >
          {/* 썸네일 영역 (작게) */}
          <a
            href={video.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flexShrink: 0 }}
          >
            <img
              src={video.thumbnail}
              alt={`${video.title} 썸네일`}
              style={{ width: "80px", height: "60px", objectFit: "cover" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/80x60?text=No+Img";
              }}
            />
          </a>

          {/* 제목 영역 */}
          <a
            href={video.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "0.85em",
              color: "#007bff",
              textDecoration: "none",
              lineHeight: 1.3,
            }}
          >
            {index + 1}. {video.title}
          </a>
        </div>
      ))}
    </div>
  );
}

export default YouTube;
