import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import { SentimentSidebar } from "@/components/SentimentSidebar";
import { TrendingSidebar } from "@/components/TrendingSidebar";
import { Chatbot } from "@/components/Chatbot";
import cryptoHero from "@/assets/crypto-hero.jpg";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  thumbnail: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  publishedAt: string;
  source: string;
}

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Bitcoin Surges Past $50,000 as Institutional Adoption Accelerates',
    summary: 'Major financial institutions continue to embrace Bitcoin, driving unprecedented institutional adoption and price momentum beyond the psychological $50,000 resistance level.',
    thumbnail: cryptoHero,
    sentiment: 'positive',
    publishedAt: '2시간 전',
    source: 'CoinDesk'
  },
  {
    id: '2',
    title: 'Ethereum 2.0 Staking Rewards Reach New All-Time High',
    summary: 'The latest Ethereum upgrade has resulted in record-breaking staking rewards, attracting more validators to secure the network and earn passive income.',
    thumbnail: cryptoHero,
    sentiment: 'positive',
    publishedAt: '4시간 전',
    source: 'CoinTelegraph'
  },
  {
    id: '3',
    title: 'Regulatory Concerns Mount as SEC Increases Crypto Scrutiny',
    summary: 'The Securities and Exchange Commission announces new investigation procedures for cryptocurrency projects, raising concerns about potential market impacts.',
    thumbnail: cryptoHero,
    sentiment: 'negative',
    publishedAt: '6시간 전',
    source: 'Bloomberg'
  },
  {
    id: '4',
    title: 'DeFi Protocol TVL Drops 15% Amid Market Uncertainty',
    summary: 'Decentralized Finance protocols experience significant outflows as investors become more cautious about yield farming strategies and smart contract risks.',
    thumbnail: cryptoHero,
    sentiment: 'negative',
    publishedAt: '8시간 전',
    source: 'DeFi Pulse'
  },
  {
    id: '5',
    title: 'Major Exchange Announces New Institutional Custody Services',
    summary: 'Leading cryptocurrency exchange platform launches comprehensive custody solutions for institutional investors, marking another step toward mainstream adoption.',
    thumbnail: cryptoHero,
    sentiment: 'positive',
    publishedAt: '12시간 전',
    source: 'CoinDesk'
  },
  {
    id: '6',
    title: 'NFT Market Shows Signs of Recovery with New Art Collections',
    summary: 'The non-fungible token market demonstrates resilience as innovative art collections and utility-focused projects attract renewed investor interest.',
    thumbnail: cryptoHero,
    sentiment: 'neutral',
    publishedAt: '1일 전',
    source: 'OpenSea'
  }
];

const Index = () => {
  const navigate = useNavigate();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const handleNewsClick = (news: NewsItem) => {
    navigate(`/news/${news.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-primary overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-4">
            CoinAdvisor
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            AI 기반 암호화폐 뉴스 분석 및 투자 전략 플랫폼
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white/20 backdrop-blur-sm text-primary-foreground border border-white/30 rounded-lg hover:bg-white/30 transition-all">
              시장 분석 보기
            </button>
            <button className="px-8 py-3 bg-white text-primary hover:bg-white/90 rounded-lg transition-all font-medium">
              무료 체험 시작하기
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Sentiment Analysis */}
          <div className="hidden lg:block">
            <SentimentSidebar />
          </div>

          {/* Main News Feed */}
          <div className="flex-1">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">최근 암호화폐 뉴스</h2>
              <p className="text-muted-foreground">실시간 암호화폐 뉴스 및 AI 투자 분석</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockNews.map((news) => (
                <NewsCard
                  key={news.id}
                  {...news}
                  onClick={() => handleNewsClick(news)}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-gradient-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-all shadow-glow">
                기사 더 불러오기
              </button>
            </div>
          </div>

          {/* Right Sidebar - Trending */}
          <div className="hidden lg:block">
            <TrendingSidebar />
          </div>
        </div>
      </div>

      {/* Floating Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Index;