// src/components/YouTube.js

import React, { useState, useEffect, useCallback } from "react";

const YOUTUBE_API_KEY = "AIzaSyD-PKu8gliO_ISgVXixZc9yE2rGrKzO1bQ";
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

// 실제 API 키가 없을 때의 Mock 썸네일 생성 함수
const getThumbnailUrl = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/default.jpg`;
};

function YouTube({ recipeName, videoCount }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    // ... (생략: 유효성 검사 로직) ...

    if (!recipeName || !YOUTUBE_API_KEY || videoCount === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const searchQuery = `${recipeName} 요리법`;

    const params = new URLSearchParams({
      part: "snippet",
      q: searchQuery,
      key: YOUTUBE_API_KEY,
      maxResults: videoCount,
      type: "video",
      regionCode: "KR",
    });

    try {
      const url = `${YOUTUBE_SEARCH_URL}?${params.toString()}`;
      const response = await fetch(url);

      // ... (생략: 오류 처리 로직) ...

      const data = await response.json();

      const videoData = data.items.map((item) => {
        const videoId = item.id.videoId;
        return {
          id: videoId,
          title: item.snippet.title,
          link: `https://www.youtube.com/watch?v=${videoId}`,
          // 썸네일 URL을 저장합니다.
          thumbnail:
            item.snippet.thumbnails?.default?.url || getThumbnailUrl(videoId),
        };
      });

      setVideos(videoData);
    } catch (error) {
      console.error("YouTube API 통신 오류:", error);
      // 🚨 오류 발생 시 Mock 데이터로 대체
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

  // ... (생략: 로딩 및 결과 없음 처리) ...

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

  // 🎯 [핵심 수정] videoCount=1일 때는 썸네일만, 3일 때는 썸네일+제목 목록

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
