// src/components/SentimentSidebar.tsx

import React, { useEffect, useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchNewsList } from "@/services/newsService";

interface NewsWithSentiment {
  id: number;
  title: string;
  publishedAt: string;
  sentiment: "positive" | "negative" | "neutral" | null;
}

interface Stats {
  positive: number;
  negative: number;
  neutral: number;
}

const SentimentSidebar: React.FC = () => {
  const [news, setNews] = useState<NewsWithSentiment[]>([]);
  const [stats, setStats] = useState<Stats>({
    positive: 0,
    negative: 0,
    neutral: 0,
  });
  const [score, setScore] = useState<number>(0);

  const computeStatsAndScore = (list: NewsWithSentiment[]) => {
    const st: Stats = { positive: 0, negative: 0, neutral: 0 };
    list.forEach((item) => {
      if (item.sentiment === "positive") st.positive++;
      else if (item.sentiment === "negative") st.negative++;
      else st.neutral++;
    });
    const total = st.positive + st.negative + st.neutral;
    const rawScore = total ? ((st.positive - st.negative) / total) * 100 : 0;
    return { stats: st, score: Math.max(-100, Math.min(100, rawScore)) };
  };

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchNewsList();
        // 최신순으로 정렬
        const sorted = list
          .slice()
          .sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() -
              new Date(a.publishedAt).getTime()
          )
          .map((n) => ({
            id: n.id,
            title: n.title,
            publishedAt: n.publishedAt,
            sentiment: n.sentiment,
          }));
        setNews(sorted);

        // 통계 및 점수 계산
        const { stats, score } = computeStatsAndScore(sorted);
        setStats(stats);
        setScore(score);
      } catch (err) {
        console.error("뉴스 로드 실패:", err);
        setNews([]);
        setStats({ positive: 0, negative: 0, neutral: 0 });
        setScore(0);
      }
    })();
  }, []);

  const positiveNews = useMemo(
    () => news.filter((n) => n.sentiment === "positive").slice(0, 5),
    [news]
  );
  const negativeNews = useMemo(
    () => news.filter((n) => n.sentiment === "negative").slice(0, 5),
    [news]
  );

  type SectionProps = {
    title: string;
    items: NewsWithSentiment[];
    icon: React.ReactNode;
    colorClass: string;
  };

  const SentimentSection: React.FC<SectionProps> = ({
    title,
    items,
    icon,
    colorClass,
  }) => (
    <Card className="bg-gradient-card border-border/50 mb-6">
      <div className={`p-4 rounded-t-lg ${colorClass}`}>
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">데이터가 없습니다.</p>
        )}
        {items.map((item) => (
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
                {new Date(item.publishedAt).toLocaleString("ko-KR")}
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
        items={positiveNews}
        icon={<TrendingUp className="w-5 h-5" />}
        colorClass="bg-success"
      />

      <SentimentSection
        title="부정 추세"
        items={negativeNews}
        icon={<TrendingDown className="w-5 h-5" />}
        colorClass="bg-destructive"
      />

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
            최근 24시간 긍정/부정/중립 비율 기반
          </p>
          <div className="mt-3 w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                score >= 0 ? "bg-success" : "bg-destructive"
              }`}
              style={{ width: `${Math.min(Math.abs(score), 100)}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SentimentSidebar;
