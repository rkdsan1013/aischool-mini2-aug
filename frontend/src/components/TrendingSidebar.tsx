import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchNewsList, NewsItem } from "@/services/newsService";
import { formatDateTime } from "@/utils/formatDate";

// 하단 인기 종목 더미 데이터
interface PopularCoin {
  name: string;
  symbol: string;
  mentions: number;
}

const mockPopularCoins: PopularCoin[] = [
  { name: "Bitcoin", symbol: "BTC", mentions: 152 },
  { name: "Ethereum", symbol: "ETH", mentions: 138 },
  { name: "Ripple", symbol: "XRP", mentions: 97 },
  { name: "Cardano", symbol: "ADA", mentions: 85 },
  { name: "Solana", symbol: "SOL", mentions: 80 },
];

// 숫자를 'K', 'M' 단위로 포맷
function formatViews(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${Math.floor(count / 1_000)}K`;
  return `${count}`;
}

export const TrendingSidebar = () => {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchNewsList()
      .then((list) => {
        // 조회수 내림차순 정렬 → 상위 4개
        const sorted = [...list].sort(
          (a, b) => (b.views ?? 0) - (a.views ?? 0)
        );
        setTrending(sorted.slice(0, 4));
      })
      .catch((err) => {
        console.error("트렌딩 뉴스 로딩 실패:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-[300px] space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground mb-2">지금 트렌드</h2>
        <p className="text-sm text-muted-foreground">실시간 인기 정보</p>
      </div>

      {/* 인기 뉴스 */}
      <Card className="bg-gradient-card border-border/50">
        <div className="p-4 bg-gradient-primary rounded-t-md">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-primary-foreground" />
            <h3 className="font-semibold text-primary-foreground">인기 뉴스</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {loading && <p className="text-center text-sm">로딩 중...</p>}

          {!loading &&
            trending.map((news) => (
              <div
                key={news.id}
                className="group cursor-pointer border-b border-border/30 last:border-b-0 pb-4 last:pb-0"
                onClick={() => navigate(`/news/${news.id}`)}
              >
                <div className="flex space-x-3">
                  <img
                    src={news.thumbnail || "/placeholder.svg"}
                    alt={news.title}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className="bg-destructive text-destructive-foreground">
                        인기
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(news.publishedAt)}
                      </span>
                    </div>
                    <h4 className="text-[12px] font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {news.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatViews(news.views ?? 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {!loading && trending.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              표시할 트렌딩 뉴스가 없습니다.
            </p>
          )}
        </div>
      </Card>

      {/* 인기 종목 (더미 유지) */}
      <Card className="bg-gradient-card border-border/50">
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-3">인기 종목</h3>
          <div className="space-y-3">
            {mockPopularCoins.map((coin, idx) => (
              <div
                key={coin.symbol}
                className="flex items-center justify-between"
              >
                <div>
                  <span className="font-medium text-foreground">
                    {idx + 1}. {coin.name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({coin.symbol})
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {coin.mentions}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
