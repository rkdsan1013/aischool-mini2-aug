import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, User, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";

interface NewsDetailData {
  id: string;
  title: string;
  summary: string;
  content: string;
  thumbnail: string;
  author: string;
  publishedAt: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  tags: string[];
}

// Mock data - in real app this would come from API
const mockNewsDetail: NewsDetailData = {
  id: '1',
  title: 'Bitcoin Surges Past $50,000 as Institutional Adoption Accelerates',
  summary: 'Major financial institutions continue to embrace Bitcoin, driving unprecedented institutional adoption and price momentum beyond the psychological $50,000 resistance level.',
  content: `
In a remarkable display of institutional confidence, Bitcoin has broken through the critical $50,000 resistance level, marking a significant milestone in cryptocurrency adoption. This surge comes as major financial institutions continue to integrate Bitcoin into their portfolios and services.

The latest rally was triggered by several key developments in the institutional space. Leading investment firm BlackRock announced an additional $2 billion allocation to Bitcoin, citing it as a hedge against inflation and currency debasement. Meanwhile, MicroStrategy revealed plans to increase their Bitcoin holdings by another $500 million.

Market analysts suggest that this price movement represents more than just speculative trading. The underlying fundamentals show strong institutional demand, with Bitcoin ETF inflows reaching record highs over the past month. On-chain data indicates that long-term holders are accumulating, suggesting confidence in Bitcoin's future prospects.

However, some experts caution about potential volatility ahead. Technical analysis shows that while the breakout is significant, Bitcoin may face resistance around the $52,000-$55,000 range. Traders are advised to monitor key support levels and market sentiment indicators closely.

The broader cryptocurrency market has responded positively to Bitcoin's performance, with Ethereum gaining 8% and altcoins showing mixed but generally positive sentiment. DeFi protocols have seen increased activity, suggesting renewed interest in the broader crypto ecosystem.
  `,
  thumbnail: '/placeholder.svg',
  author: 'Sarah Chen',
  publishedAt: '2 hours ago',
  source: 'CoinDesk',
  sentiment: 'positive',
  tags: ['Bitcoin', 'Institutional Adoption', 'Price Analysis', 'ETF']
};

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Badge className="bg-success text-success-foreground">긍정</Badge>;
      case 'negative':
        return <Badge className="bg-destructive text-destructive-foreground">부정</Badge>;
      default:
        return <Badge variant="secondary">중립</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-card border-border/50 overflow-hidden">
            {/* Article Header */}
            <div className="relative">
              <img 
                src={mockNewsDetail.thumbnail} 
                alt={mockNewsDetail.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 left-4">
                {getSentimentBadge(mockNewsDetail.sentiment)}
              </div>
            </div>

            {/* Article Content */}
            <div className="p-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {mockNewsDetail.title}
              </h1>

              {/* Meta Information */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{mockNewsDetail.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{mockNewsDetail.publishedAt}</span>
                  </div>
                  <span className="font-medium">{mockNewsDetail.source}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    공유
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bookmark className="w-4 h-4 mr-2" />
                    저장
                  </Button>
                </div>
              </div>

              {/* AI Summary */}
              <Card className="bg-primary/10 border-primary/20 p-6 mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  AI Summary
                </h2>
                <p className="text-foreground leading-relaxed">
                  {mockNewsDetail.summary}
                </p>
              </Card>

              {/* Article Body */}
              <div className="prose prose-lg max-w-none">
                {mockNewsDetail.content.split('\n\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="text-foreground leading-relaxed mb-4">
                      {paragraph.trim()}
                    </p>
                  )
                ))}
              </div>

              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {mockNewsDetail.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}