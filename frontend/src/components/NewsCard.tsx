import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils/formatDate";

export interface NewsCardProps {
  id: number;
  title: string;
  summary: string;
  thumbnail: string;
  sentiment: "positive" | "negative" | "neutral";
  publishedAt: string; // ISO 날짜 문자열
  source: string;
  onClick?: () => void;
}

export const NewsCard = ({
  title,
  summary,
  thumbnail,
  sentiment,
  publishedAt,
  source,
  onClick,
}: NewsCardProps) => {
  const getSentimentIcon = () => {
    if (sentiment === "positive")
      return <TrendingUp className="w-4 h-4 text-success" />;
    if (sentiment === "negative")
      return <TrendingDown className="w-4 h-4 text-destructive" />;
    return null;
  };

  const getSentimentBadge = () => {
    if (sentiment === "positive") {
      return <Badge className="bg-success text-success-foreground">긍정</Badge>;
    }
    if (sentiment === "negative") {
      return (
        <Badge className="bg-destructive text-destructive-foreground">
          부정
        </Badge>
      );
    }
    return <Badge variant="secondary">중립</Badge>;
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      className="group cursor-pointer transition-all duration-300 
                 hover:shadow-float hover:-translate-y-1 
                 bg-gradient-card border-border/50 outline-none 
                 focus:ring-2 focus:ring-primary/40"
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="relative overflow-hidden rounded-t-sm">
        <img
          src={thumbnail || "/placeholder.svg"}
          alt={title}
          className="w-full h-20 object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">{getSentimentBadge()}</div>
        <div className="absolute top-3 right-3">{getSentimentIcon()}</div>
      </div>

      <div className="p-4">
        <h3
          className="text-[13px] font-semibold text-foreground mb-2 line-clamp-1
                       group-hover:text-primary transition-colors"
        >
          {title}
        </h3>
        <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2">
          {summary}
        </p>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="font-medium">{source}</span>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            {/* 포맷된 날짜/시간 표시 */}
            <span>{formatDateTime(publishedAt)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
