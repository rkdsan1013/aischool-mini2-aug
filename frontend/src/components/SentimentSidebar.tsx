import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SentimentNews {
  id: string;
  title: string;
  sentiment: 'positive' | 'negative';
  impact: 'high' | 'medium' | 'low';
  time: string;
}

const mockSentimentNews: SentimentNews[] = [
  {
    id: '1',
    title: 'Bitcoin Breaks $50K Resistance Level',
    sentiment: 'positive',
    impact: 'high',
    time: '2h ago'
  },
  {
    id: '2',
    title: 'Ethereum ETF Approval Expected',
    sentiment: 'positive',
    impact: 'high',
    time: '4h ago'
  },
  {
    id: '3',
    title: 'Regulatory Concerns Rise in Asia',
    sentiment: 'negative',
    impact: 'medium',
    time: '6h ago'
  },
  {
    id: '4',
    title: 'DeFi Protocol TVL Drops 15%',
    sentiment: 'negative',
    impact: 'medium',
    time: '8h ago'
  },
  {
    id: '5',
    title: 'Major Exchange Adds Staking',
    sentiment: 'positive',
    impact: 'low',
    time: '12h ago'
  }
];

export const SentimentSidebar = () => {
  const positiveNews = mockSentimentNews.filter(news => news.sentiment === 'positive');
  const negativeNews = mockSentimentNews.filter(news => news.sentiment === 'negative');

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const SentimentSection = ({ 
    title, 
    news, 
    icon, 
    colorClass 
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
            <Badge className={getImpactColor(item.impact)}>
              {item.impact.toUpperCase()}
            </Badge>
              <span className="text-xs text-muted-foreground">{item.time}</span>
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
        <h2 className="text-lg font-bold text-foreground mb-2">Market Sentiment</h2>
        <p className="text-sm text-muted-foreground">Live investment sentiment analysis</p>
      </div>

      <SentimentSection
        title="Bullish Signals"
        news={positiveNews}
        icon={<TrendingUp className="w-5 h-5" />}
        colorClass="bg-success"
      />

      <SentimentSection
        title="Bearish Signals"
        news={negativeNews}
        icon={<TrendingDown className="w-5 h-5" />}
        colorClass="bg-destructive"
      />

      <Card className="bg-gradient-card border-border/50">
        <div className="p-4 bg-primary rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary-foreground" />
            <h3 className="font-semibold text-primary-foreground">Sentiment Score</h3>
          </div>
        </div>
        <div className="p-4 text-center">
          <div className="text-3xl font-bold text-success mb-2">+65%</div>
          <p className="text-sm text-muted-foreground">Overall market sentiment</p>
          <div className="mt-3 w-full bg-muted rounded-full h-2">
            <div className="bg-success h-2 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>
      </Card>
    </div>
  );
};