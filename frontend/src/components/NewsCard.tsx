import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NewsCardProps {
  id: number; // ✅ 정수 타입으로 변경
  title: string;
  summary: string;
  thumbnail: string;
  sentiment: "positive" | "negative" | "neutral";
  publishedAt: string;
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
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "negative":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getSentimentBadge = () => {
    switch (sentiment) {
      case "positive":
        return (
          <Badge className="bg-success text-success-foreground">긍정</Badge>
        );
      case "negative":
        return (
          <Badge className="bg-destructive text-destructive-foreground">
            부정
          </Badge>
        );
      default:
        return <Badge variant="secondary">중립</Badge>;
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      className="group cursor-pointer transition-all duration-300 hover:shadow-float hover:-translate-y-1 bg-gradient-card border-border/50 outline-none focus:ring-2 focus:ring-primary/40"
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={thumbnail || "/placeholder.svg"}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">{getSentimentBadge()}</div>
        <div className="absolute top-3 right-3">{getSentimentIcon()}</div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
          {summary}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">{source}</span>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{publishedAt}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
