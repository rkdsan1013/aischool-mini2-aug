import { get } from "./apiClient";

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  thumbnail: string;
  sentiment: "positive" | "negative" | "neutral";
  publishedAt: string;
  source: string;
}

// 전체 목록 조회
export const fetchNewsList = () => {
  return get<NewsItem[]>("/news");
};

// 개별 상세 조회
export const fetchNewsDetail = (id: number) => {
  return get<NewsDetailData>(`/news/${id}`);
};

export interface NewsDetailData {
  id: number;
  title: string;
  summary: string;
  content: string;
  thumbnail: string;
  publishedAt: string;
  source: string;
  sentiment: "positive" | "negative" | "neutral";
  tags: string[];
  url?: string;
}
