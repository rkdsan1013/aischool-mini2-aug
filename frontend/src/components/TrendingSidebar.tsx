import { Flame, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrendingNews {
  id: string;
  title: string;
  views: string;
  publishedAt: string;
  thumbnail: string;
}

const mockTrendingNews: TrendingNews[] = [
  {
    id: "1",
    title: "AI Predicts Bitcoin Price Movement with 95% Accuracy",
    views: "125K",
    publishedAt: "3시간 전",
    thumbnail: "/placeholder.svg",
  },
  {
    id: "2",
    title: "Massive Whale Movement Detected in Ethereum",
    views: "89K",
    publishedAt: "5시간 전",
    thumbnail: "/placeholder.svg",
  },
  {
    id: "3",
    title: "New Regulation Could Impact DeFi Protocols",
    views: "67K",
    publishedAt: "7시간 전",
    thumbnail: "/placeholder.svg",
  },
  {
    id: "4",
    title: "Crypto Adoption Rate Hits All-Time High",
    views: "45K",
    publishedAt: "9시간 전",
    thumbnail: "/placeholder.svg",
  },
];

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

export const TrendingSidebar = () => {
  return (
    <div className="w-80 space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground mb-2">지금 트렌드</h2>
        <p className="text-sm text-muted-foreground">실시간 인기 정보</p>
      </div>

      {/* 인기 뉴스 */}
      <Card className="bg-gradient-card border-border/50">
        <div className="p-4 bg-gradient-primary rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-primary-foreground" />
            <h3 className="font-semibold text-primary-foreground">인기 뉴스</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {mockTrendingNews.map((news) => (
            <div
              key={news.id}
              className="group cursor-pointer border-b border-border/30 last:border-b-0 pb-4 last:pb-0"
            >
              <div className="flex space-x-3">
                <img
                  src={news.thumbnail}
                  alt={news.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className="bg-destructive text-destructive-foreground">
                      인기
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {news.publishedAt}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {news.title}
                  </h4>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{news.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 인기 종목 */}
      <Card className="bg-gradient-card border-border/50">
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-3">인기 종목</h3>
          <div className="space-y-3">
            {mockPopularCoins.map((coin, index) => (
              <div
                key={coin.symbol}
                className="flex items-center justify-between"
              >
                <div>
                  <span className="font-medium text-foreground">
                    {index + 1}. {coin.name}
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
