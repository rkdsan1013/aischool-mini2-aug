import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import SentimentSidebar from "@/components/SentimentSidebar";
import { TrendingSidebar } from "@/components/TrendingSidebar";
import { Chatbot } from "@/components/Chatbot";
import {
  fetchNewsList,
  triggerNewsFetch,
  purgeAllNews, // 추가 import
  NewsItem,
} from "@/services/newsService";

const Index = () => {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false); // 삭제 중 상태

  const loadNews = () => {
    setLoading(true);
    fetchNewsList()
      .then((data) => setNewsList(data))
      .catch((err) => console.error("뉴스 로딩 실패:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleNewsClick = (news: NewsItem) => {
    navigate(`/news/${news.id}`);
  };

  // 뉴스 강제 갱신 (개발자모드)
  const handleRefreshClick = async () => {
    try {
      setRefreshing(true);
      await triggerNewsFetch();
      alert("뉴스 갱신 완료");
      loadNews();
    } catch {
      alert("뉴스 갱신 실패");
    } finally {
      setRefreshing(false);
    }
  };

  // 뉴스 전체 삭제 (개발자모드)
  const handleDeleteClick = async () => {
    if (!window.confirm("모든 뉴스를 정말 삭제하시겠습니까?")) return;

    try {
      setDeleting(true);
      await purgeAllNews();
      alert("모든 뉴스가 삭제되었습니다.");
      setNewsList([]); // 화면 즉시 빈 리스트로
    } catch {
      alert("뉴스 삭제 실패");
    } finally {
      setDeleting(false);
    }
  };

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
            <button
              onClick={handleDeleteClick}
              disabled={deleting}
              className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              {deleting ? "삭제 중..." : "뉴스 삭제 (개발자모드)"}
            </button>
            <button
              onClick={handleRefreshClick}
              disabled={refreshing}
              className="px-8 py-3 bg-white text-primary hover:bg-white/90 rounded-lg transition-all font-medium"
            >
              {refreshing ? "갱신 중..." : "뉴스 갱신 (개발자모드)"}
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block">
            <SentimentSidebar />
          </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsList.map((news) => (
                  <NewsCard
                    key={news.id}
                    {...news}
                    onClick={() => handleNewsClick(news)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <TrendingSidebar />
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
};

export default Index;
