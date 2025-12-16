// YouTube.jsx
import React, { useState, useEffect, useCallback } from "react";
import "../css/YouTube.css"; // ⭐ CSS 파일 임포트

// 실제 API 키가 없을 때의 Mock 썸네일 생성 함수
const getThumbnailUrl = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/default.jpg`;
};

function YouTube({ recipeName, videoCount }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    // 1. 유효성 검사
    if (!recipeName || videoCount === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // 2. 백엔드 프록시 API로 요청 (검색어와 개수만 보냄)
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

  if (loading) {
    return <div className="video-loading">영상 검색 중...</div>;
  }

  if (videos.length === 0) {
    return <div className="no-video">연관 영상 없음</div>;
  }

  // A. 요약 뷰 (썸네일만 크게 - videoCount = 1)
  if (videoCount === 1) {
    const video = videos[0];
    return (
      <a
        href={video.link}
        target="_blank"
        rel="noopener noreferrer"
        className="video-summary-view" // ⭐ 클래스 적용
      >
        <img
          src={video.thumbnail}
          alt={`${video.title} 썸네일`}
          className="summary-thumbnail-img" // ⭐ 클래스 적용
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
    <div className="video-list">
      {" "}
      {/* ⭐ 클래스 적용 */}
      {videos.map((video, index) => (
        <div
          key={video.id}
          className="video-item" // ⭐ 클래스 적용
          // ❌ 동적 스타일 제거됨. CSS의 :not(:last-child)가 처리함.
        >
          {/* 썸네일 영역 (작게) */}
          <a
            href={video.link}
            target="_blank"
            rel="noopener noreferrer"
            className="video-thumbnail-link" // ⭐ 클래스 적용
          >
            <img
              src={video.thumbnail}
              alt={`${video.title} 썸네일`}
              className="video-thumbnail-img" // ⭐ 클래스 적용
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
            className="video-title-link" // ⭐ 클래스 적용
          >
            {index + 1}. {video.title}
          </a>
        </div>
      ))}
    </div>
  );
}

export default YouTube;
