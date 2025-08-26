// src/services/newsService.ts

import { get, post, remove } from "./apiClient";

// 기존 뉴스 타입
export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  thumbnail: string;
  sentiment: "positive" | "negative" | "neutral" | null;
  publishedAt: string;
  source: string;
  views: number;
}

export interface NewsDetailData {
  id: number;
  title: string;
  summary: string;
  content: string;
  thumbnail: string;
  publishedAt: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral" | null;
  tags: string[];
  url?: string;
}

// 전체 뉴스 목록 조회 (sentiment 정보 포함)
export const fetchNewsList = () => get<NewsItem[]>("/news");

// 뉴스 상세 조회
export const fetchNewsDetail = (id: number) =>
  get<NewsDetailData>(`/news/${id}`);

// 개발자 모드: 뉴스 강제 갱신
export const triggerNewsFetch = () => post<void>("/news/fetch");

// 개발자 모드: 뉴스 전체 삭제
export const purgeAllNews = () => remove<void>("/news");
