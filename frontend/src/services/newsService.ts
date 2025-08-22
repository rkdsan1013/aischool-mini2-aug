import { get } from "./apiClient";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  thumbnail: string;
  sentiment: "positive" | "negative" | "neutral";
  publishedAt: string;
  source: string;
}

export const fetchNewsList = () => {
  return get<NewsItem[]>("/news");
};
