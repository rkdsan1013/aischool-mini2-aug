import { TrendingUp, Coins, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border shadow-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 클릭 시 홈으로 이동 */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <Coins className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">CoinAdvisor</h1>
            <p className="text-xs text-muted-foreground">
              Investment Sentiment AI
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            마켓
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            뉴스
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            분석
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            트렌드
          </Button>
        </nav>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <User className="w-4 h-4 mr-2" />
            로그인
          </Button>
          <Button
            size="sm"
            className="bg-gradient-primary bg-black hover:bg-primary-hover shadow-glow"
          >
            구독하기
          </Button>
        </div>
      </div>
    </header>
  );
};
