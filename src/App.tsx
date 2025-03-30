import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { UserProvider } from "@/contexts/UserContext";
import { StudyProvider } from "@/contexts/StudyContext";
import { AnkiProvider } from "@/contexts/AnkiContext";
import { RSVPProvider } from "@/contexts/RSVPContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingTimer from "@/components/FloatingTimer";

import Index from "@/pages/Index";
import MethodSelection from "@/pages/MethodSelection";
import PomodoroTimer from "@/pages/PomodoroTimer";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import Anki from "@/pages/Anki";
import RSVP from "@/pages/RSVP";
import Challenge from "@/pages/Challenge";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <UserProvider>
          <StudyProvider>
            <AnkiProvider>
              <RSVPProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/methods" element={<MethodSelection />} />
                        <Route path="/pomodoro" element={<PomodoroTimer />} />
                        <Route path="/anki" element={<Anki />} />
                        <Route path="/rsvp" element={<RSVP />} />
                        <Route path="/challenge" element={<Challenge />} />
                        <Route path="/progress" element={<Progress />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                  <FloatingTimer />
                </BrowserRouter>
              </RSVPProvider>
            </AnkiProvider>
          </StudyProvider>
        </UserProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
