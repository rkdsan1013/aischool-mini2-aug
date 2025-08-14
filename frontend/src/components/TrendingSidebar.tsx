import { Flame, Eye, MessageCircle, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrendingNews {
  id: string;
  title: string;
  views: string;
  comments: number;
  trend: 'up' | 'hot';
  time: string;
  thumbnail: string;
}

const mockTrendingNews: TrendingNews[] = [
  {
    id: '1',
    title: 'AI Predicts Bitcoin Price Movement with 95% Accuracy',
    views: '125K',
    comments: 342,
    trend: 'hot',
    time: '3h ago',
    thumbnail: '/placeholder.svg'
  },
  {
    id: '2',
    title: 'Massive Whale Movement Detected in Ethereum',
    views: '89K',
    comments: 156,
    trend: 'up',
    time: '5h ago',
    thumbnail: '/placeholder.svg'
  },
  {
    id: '3',
    title: 'New Regulation Could Impact DeFi Protocols',
    views: '67K',
    comments: 89,
    trend: 'up',
    time: '7h ago',
    thumbnail: '/placeholder.svg'
  },
  {
    id: '4',
    title: 'Crypto Adoption Rate Hits All-Time High',
    views: '45K',
    comments: 234,
    trend: 'hot',
    time: '9h ago',
    thumbnail: '/placeholder.svg'
  }
];

export const TrendingSidebar = () => {
  return (
    <div className="w-80 space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground mb-2">Trending Now</h2>
        <p className="text-sm text-muted-foreground">Most popular crypto stories</p>
      </div>

      <Card className="bg-gradient-card border-border/50">
        <div className="p-4 bg-gradient-primary rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-primary-foreground" />
            <h3 className="font-semibold text-primary-foreground">Hot Topics</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {mockTrendingNews.map((news) => (
            <div key={news.id} className="group cursor-pointer border-b border-border/30 last:border-b-0 pb-4 last:pb-0">
              <div className="flex space-x-3">
                <img 
                  src={news.thumbnail} 
                  alt={news.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {news.trend === 'hot' ? (
                      <Badge className="bg-destructive text-destructive-foreground">
                        <Flame className="w-3 h-3 mr-1" />
                        HOT
                      </Badge>
                    ) : (
                      <Badge className="bg-success text-success-foreground">
                        <ArrowUp className="w-3 h-3 mr-1" />
                        RISING
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{news.time}</span>
                  </div>
                  <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {news.title}
                  </h4>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{news.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{news.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-gradient-card border-border/50">
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-3">Market Movers</h3>
          <div className="space-y-3">
            {[
              { name: 'Bitcoin', symbol: 'BTC', change: '+5.2%', color: 'text-success' },
              { name: 'Ethereum', symbol: 'ETH', change: '+3.8%', color: 'text-success' },
              { name: 'Ripple', symbol: 'XRP', change: '-2.1%', color: 'text-destructive' },
              { name: 'Cardano', symbol: 'ADA', change: '+1.5%', color: 'text-success' }
            ].map((coin) => (
              <div key={coin.symbol} className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-foreground">{coin.name}</span>
                  <span className="text-xs text-muted-foreground ml-1">({coin.symbol})</span>
                </div>
                <span className={`font-medium ${coin.color}`}>{coin.change}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};