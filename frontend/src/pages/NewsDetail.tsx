// src/pages/NewsDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Share2, Bookmark, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";

const API_BASE = import.meta.env.VITE_API_URL!;

interface NewsDetailData {
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

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/news/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: NewsDetailData = await res.json();
        setNews(data);
      } catch (err) {
        console.error("뉴스 상세 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-8 text-center">로딩 중...</div>;
  if (!news)
    return <div className="p-8 text-center">뉴스를 불러올 수 없습니다.</div>;

  const getSentimentBadge = (s: string) => {
    if (s === "positive")
      return <Badge className="bg-success text-success-foreground">긍정</Badge>;
    if (s === "negative")
      return (
        <Badge className="bg-destructive text-destructive-foreground">
          부정
        </Badge>
      );
    return <Badge variant="secondary">중립</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> 돌아가기
        </Button>

        <Card className="bg-gradient-card border-border/50 overflow-hidden max-w-4xl mx-auto">
          <div className="relative">
            <img
              src={news.thumbnail}
              alt={news.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-4 left-4">
              {getSentimentBadge(news.sentiment)}
            </div>
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">{news.title}</h1>
            <div className="flex justify-between mb-6 pb-6 border-b">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{news.source}</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{news.publishedAt}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {news.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(news.url, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> 원문보기
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" /> 공유
                </Button>
                <Button variant="outline" size="sm">
                  <Bookmark className="w-4 h-4 mr-2" /> 저장
                </Button>
              </div>
            </div>

            <Card className="bg-primary/10 border-primary/20 p-6 mb-8">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-2" /> AI
                요약
              </h2>
              <p>{news.summary}</p>
            </Card>

            <div className="prose prose-lg max-w-none">
              {news.content.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {news.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm mb-3 text-muted-foreground">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {news.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
