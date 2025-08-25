import { get, post, remove } from "./apiClient";

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

// 전체 뉴스 목록 조회
export const fetchNewsList = () => {
  return get<NewsItem[]>("/news");
};

// 뉴스 상세 조회
export const fetchNewsDetail = (id: number) => {
  return get<NewsDetailData>(`/news/${id}`);
};

// 개발자 모드: 뉴스 강제 갱신
export const triggerNewsFetch = () => {
  return post<void>("/news/fetch");
};

export const purgeAllNews = () => remove<void>("/news");
