import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Lobbies from "./pages/Lobbies";
import MyTournaments from "./pages/MyTournaments";
import MyStream from "./pages/MyStream";
import MyProfile from "./pages/MyProfile";
import Leaderboards from "./pages/Leaderboards";
import Events from "./pages/Events";
import Support from "./pages/Support";
import Rules from "./pages/Rules";
import About from "./pages/About";
import Settings from "./pages/Settings";
import Rewards from "./pages/Rewards";
import FlockTube from "./pages/FlockTube";
import Props from "./pages/Props";
import NotFound from "./pages/NotFound";
import { CreateChallengeDrawer } from "@/components/challenges/CreateChallengeDrawer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Lobbies />} />
          <Route path="/lobbies" element={<Lobbies />} />
          <Route path="/props" element={<Props />} />
          <Route path="/my-tournaments" element={<MyTournaments />} />
          <Route path="/my-stream" element={<MyStream />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/leaderboards" element={<Leaderboards />} />
          <Route path="/events" element={<Events />} />
          <Route path="/support" element={<Support />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/flocktube" element={<FlockTube />} />
          
          {/* Legacy redirects (permanent 308 redirects) */}
          <Route path="/find-match" element={<Navigate to="/my-profile?tab=matches" replace />} />
          <Route path="/find" element={<Navigate to="/my-profile?tab=matches" replace />} />
          <Route path="/match/find" element={<Navigate to="/my-profile?tab=matches" replace />} />
          <Route path="/history" element={<Navigate to="/my-profile?tab=history" replace />} />
          <Route path="/match-history" element={<Navigate to="/my-profile?tab=history" replace />} />
          <Route path="/history/matches" element={<Navigate to="/my-profile?tab=history" replace />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CreateChallengeDrawer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
