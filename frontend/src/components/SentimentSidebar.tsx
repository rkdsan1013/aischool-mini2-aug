import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SentimentNews {
  id: string;
  title: string;
  sentiment: "positive" | "negative";
  publishedAt: string;
}

const mockSentimentNews: SentimentNews[] = [
  {
    id: "1",
    title: "Bitcoin Breaks $50K Resistance Level",
    sentiment: "positive",
    publishedAt: "2시간 전",
  },
  {
    id: "2",
    title: "Ethereum ETF Approval Expected",
    sentiment: "positive",
    publishedAt: "4시간 전",
  },
  {
    id: "3",
    title: "Regulatory Concerns Rise in Asia",
    sentiment: "negative",
    publishedAt: "6시간 전",
  },
  {
    id: "4",
    title: "DeFi Protocol TVL Drops 15%",
    sentiment: "negative",
    publishedAt: "8시간 전",
  },
  {
    id: "5",
    title: "Major Exchange Adds Staking",
    sentiment: "positive",
    publishedAt: "12시간 전",
  },
];

interface SentimentStats {
  positive: number;
  negative: number;
  neutral: number;
}

export const SentimentSidebar = () => {
  const positiveNews = mockSentimentNews.filter(
    (n) => n.sentiment === "positive"
  );
  const negativeNews = mockSentimentNews.filter(
    (n) => n.sentiment === "negative"
  );

  const [stats, setStats] = useState<SentimentStats>({
    positive: 0,
    negative: 0,
    neutral: 0,
  });
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    // ✅ 실제 서비스에서는 /api/sentiment/stats?range=24h 호출
    // fetch("/api/sentiment/stats?range=24h")
    //   .then(res => res.json())
    //   .then(data => setStats(data));

    const mockStats: SentimentStats = {
      positive: 65,
      negative: 25,
      neutral: 10,
    };
    setStats(mockStats);

    const total = mockStats.positive + mockStats.negative + mockStats.neutral;
    const calcScore =
      total > 0 ? ((mockStats.positive - mockStats.negative) / total) * 100 : 0;
    setScore(calcScore);
  }, []);

  const SentimentSection = ({
    title,
    news,
    icon,
    colorClass,
  }: {
    title: string;
    news: SentimentNews[];
    icon: React.ReactNode;
    colorClass: string;
  }) => (
    <Card className="bg-gradient-card border-border/50 mb-6">
      <div className={`p-4 rounded-t-lg ${colorClass}`}>
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {news.map((item) => (
          <div key={item.id} className="group cursor-pointer">
            <div className="flex items-start justify-between mb-1">
              <Badge
                className={
                  item.sentiment === "positive"
                    ? "bg-success text-success-foreground"
                    : "bg-destructive text-destructive-foreground"
                }
              >
                {item.sentiment === "positive" ? "긍정" : "부정"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {item.publishedAt}
              </span>
            </div>
            <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-3">
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="w-80 space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground mb-2">시장 분석</h2>
        <p className="text-sm text-muted-foreground">실시간 시장 감정 분석</p>
      </div>

      <SentimentSection
        title="긍정 추세"
        news={positiveNews}
        icon={<TrendingUp className="w-5 h-5" />}
        colorClass="bg-success"
      />

      <SentimentSection
        title="부정 추세"
        news={negativeNews}
        icon={<TrendingDown className="w-5 h-5" />}
        colorClass="bg-destructive"
      />

      {/* 분석 점수 */}
      <Card className="bg-gradient-card border-border/50">
        <div className="p-4 bg-primary rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary-foreground" />
            <h3 className="font-semibold text-primary-foreground">분석 점수</h3>
          </div>
        </div>
        <div className="p-4 text-center">
          <div
            className={`text-3xl font-bold mb-2 ${
              score >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {score >= 0 ? "+" : ""}
            {score.toFixed(1)}%
          </div>
          <p className="text-sm text-muted-foreground">
            최근 24시간 긍정/부정 비율 기반
          </p>
          <div className="mt-3 w-full bg-muted rounded-full h-2">
            <div
              className={`${
                score >= 0 ? "bg-success" : "bg-destructive"
              } h-2 rounded-full`}
              style={{ width: `${Math.min(Math.abs(score), 100)}%` }}
            ></div>
          </div>
        </div>
      </Card>
    </div>
  );
};
