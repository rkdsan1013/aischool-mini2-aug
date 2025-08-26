// src/pages/Index.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import SentimentSidebar from "@/components/SentimentSidebar";
import { TrendingSidebar } from "@/components/TrendingSidebar";
import {
  fetchNewsList,
  triggerNewsFetch,
  purgeAllNews,
  NewsItem,
} from "@/services/newsService";

const ITEMS_PER_PAGE = 6;

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);

  const loadNews = () => {
    setLoading(true);
    fetchNewsList()
      .then((data) => {
        setNewsList(data);
        setPage(1);
      })
      .catch((err) => console.error("뉴스 로딩 실패:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleNewsClick = (news: NewsItem) => {
    navigate(`/news/${news.id}`);
  };

  const handleRefreshClick = async () => {
    setRefreshing(true);
    try {
      await triggerNewsFetch();
      alert("뉴스 갱신 완료");
      loadNews();
    } catch {
      alert("뉴스 갱신 실패");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!window.confirm("모든 뉴스를 정말 삭제하시겠습니까?")) return;

    setDeleting(true);
    try {
      await purgeAllNews();
      alert("모든 뉴스가 삭제되었습니다.");
      setNewsList([]);
      setPage(1);
    } catch {
      alert("뉴스 삭제 실패");
    } finally {
      setDeleting(false);
    }
  };

  const displayedNews = newsList.slice(0, page * ITEMS_PER_PAGE);
  const hasMore = displayedNews.length < newsList.length;

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />

      {/* Hero */}
      <div className="relative bg-gradient-primary overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-4">
            CoinAdvisor
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            AI 기반 암호화폐 뉴스 분석 및 투자 전략 플랫폼
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* 기존 개발자 모드 버튼 제거 */}
            <button
              className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-all font-medium"
              onClick={() => alert("더미 버튼입니다.")}
            >
              구독하기
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="hidden lg:block">
            <SentimentSidebar />
          </div>

          {/* News Feed */}
          <div className="flex-1">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                최근 암호화폐 뉴스
              </h2>
              <p className="text-muted-foreground">
                실시간 암호화폐 뉴스 및 AI 투자 분석
              </p>
            </div>

            {loading ? (
              <p>뉴스 불러오는 중...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayedNews.map((news) => (
                    <NewsCard
                      key={news.id}
                      {...news}
                      onClick={() => handleNewsClick(news)}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                    >
                      더보기
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block">
            <TrendingSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
