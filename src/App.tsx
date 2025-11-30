import React, { useEffect } from "react";
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
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import VerifyEmail from "./pages/VerifyEmail";
import Wallet from "./pages/Wallet";
import Matches from "./pages/Matches";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ConsoleLobby from "./pages/ConsoleLobby";
import CloudLobby from "./pages/CloudLobby";
import TestLobby from "./pages/TestLobby";
import { CreateChallengeDrawer } from "@/components/challenges/CreateChallengeDrawer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/store/useAuth";

const queryClient = new QueryClient();

// Initialize auth state on app start
const App = () => {
  // Initialize authentication state when app starts
  React.useEffect(() => {
    useAuth.getState().initialize();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Lobbies />} />
              <Route path="/lobbies" element={<Lobbies />} />
              <Route path="/props" element={<Props />} />
              <Route path="/leaderboards" element={<Leaderboards />} />
              <Route path="/events" element={<Events />} />
              <Route path="/support" element={<Support />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/about" element={<About />} />
              <Route path="/flocktube" element={<FlockTube />} />
              
              {/* Admin route */}
              <Route path="/admin" element={<Admin />} />
              
              {/* Profile route */}
              <Route path="/profile" element={<Profile />} />
              
              {/* Lobby routes */}
              <Route path="/lobby/console/:matchId" element={<ConsoleLobby />} />
              <Route path="/lobby/cloud/:matchId" element={<CloudLobby />} />
              <Route path="/test-lobby" element={<TestLobby />} />
            
            {/* Auth routes (redirect if already authenticated) */}
            <Route path="/login" element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } />
            <Route path="/signup" element={
              <ProtectedRoute requireAuth={false}>
                <SignUp />
              </ProtectedRoute>
            } />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            {/* Protected routes (require authentication) */}
            <Route path="/my-tournaments" element={
              <ProtectedRoute>
                <MyTournaments />
              </ProtectedRoute>
            } />
            <Route path="/my-stream" element={
              <ProtectedRoute>
                <MyStream />
              </ProtectedRoute>
            } />
            <Route path="/my-profile" element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/rewards" element={
              <ProtectedRoute>
                <Rewards />
              </ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            } />
            <Route path="/matches" element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            } />
          
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
};

export default App;
