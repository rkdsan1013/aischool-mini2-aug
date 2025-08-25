// src/components/Chatbot.tsx

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendChat } from "@/services/chatService";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "안녕하세요! 저는 여러분의 AI 투자 자문봇입니다. 암호화폐 시장 심리, 뉴스 분석 또는 트레이딩 인사이트에 대해 문의해주세요.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // 끝 요소에 스크롤하기 위한 ref
  const endRef = useRef<HTMLDivElement>(null);

  // 새 메시지 추가될 때마다 스크롤을 끝으로 이동
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSend = async () => {
    const question = inputValue.trim();
    if (!question) return;

    // 사용자 메시지 추가
    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // 백엔드로 전송
    try {
      const { answer } = await sendChat(question);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errMsg: Message = {
        id: (Date.now() + 2).toString(),
        type: "bot",
        content: "죄송합니다. 답변을 생성하는 중에 오류가 발생했습니다.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full
                   bg-gradient-primary hover:bg-primary-hover
                   shadow-float transition-all duration-300
                   hover:scale-110 z-50"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card
      className="fixed bottom-6 right-6 w-96 h-[500px]
                     bg-card border border-border shadow-float z-50
                     flex flex-col"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between
                      p-4 bg-gradient-primary rounded-t-lg"
      >
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-primary-foreground" />
          <span className="font-semibold text-primary-foreground">
            AI Advisor
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-primary-foreground hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <div className="flex items-start space-x-2">
                  {msg.type === "bot" ? (
                    <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 메시지 끝으로 스크롤 */}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="메세지를 입력해주세요."
            onKeyPress={(e) => e.key === "Enter" && !isTyping && handleSend()}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="bg-gradient-primary hover:bg-primary-hover"
            disabled={!inputValue.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
