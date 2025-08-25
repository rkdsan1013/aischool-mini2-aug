// src/components/SentimentSidebar.tsx

import React, { useEffect, useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  fetchSentimentNews,
  fetchSentimentStats,
  SentimentNews,
  SentimentStats,
} from "@/services/newsService";

const SentimentSidebar: React.FC = () => {
  const [news, setNews] = useState<SentimentNews[]>([]);
  const [stats, setStats] = useState<SentimentStats>({
    positive: 0,
    negative: 0,
    neutral: 0,
  });
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    (async () => {
      // 1) 긍정/부정 뉴스 가져오기
      try {
        const list = await fetchSentimentNews();
        setNews(list);
      } catch (err) {
        console.error("감성 뉴스 로드 실패:", err);
        setNews([]);
      }

      // 2) 감성 통계(24h) 가져오기
      try {
        const st = await fetchSentimentStats("24h");
        setStats(st);

        // 점수 계산: (positive − negative) / total * 100
        const total = st.positive + st.negative + st.neutral;
        setScore(total > 0 ? ((st.positive - st.negative) / total) * 100 : 0);
      } catch (err) {
        console.error("감성 통계 로드 실패:", err);
        setStats({ positive: 0, negative: 0, neutral: 0 });
        setScore(0);
      }
    })();
  }, []);

  // UI에는 긍정/부정만, 중립 뉴스는 목록에 표시 안함
  const positiveNews = useMemo(
    () => news.filter((n) => n.sentiment === "positive"),
    [news]
  );
  const negativeNews = useMemo(
    () => news.filter((n) => n.sentiment === "negative"),
    [news]
  );

  const SentimentSection = ({
    title,
    items,
    icon,
    colorClass,
  }: {
    title: string;
    items: SentimentNews[];
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
                {new Date(item.publishedAt).toLocaleString()}
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
