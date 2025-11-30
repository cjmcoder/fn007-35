import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onClose();
    navigate('/login');
  };

  const handleSignUp = () => {
    onClose();
    navigate('/signup');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text text-center">
            Sign In to FLOCKNODE
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Access your gaming profile and compete with the best
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center space-y-3">
            <p className="text-muted-foreground">
              Choose how you'd like to get started with FLOCKNODE
            </p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleSignIn}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold"
            >
              Sign In
            </Button>
            
            <Button
              onClick={handleSignUp}
              variant="outline"
              className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              Create Account
            </Button>
          </div>
        </div>
        
        <div className="text-center">
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            Continue browsing without signing in
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
