// src/App.tsx

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollToTop from "@/components/ScrollToTop";
import { Chatbot } from "@/components/Chatbot";

import Index from "@/pages/Index";
import NewsDetail from "@/pages/NewsDetail";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />

        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Chatbot 컴포넌트를 Routes 바깥에 배치하여 모든 페이지에서 노출 */}
        <Chatbot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
