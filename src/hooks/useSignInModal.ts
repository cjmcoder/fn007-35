import { useState } from "react";
import { useAuth } from "@/store/useAuth";

export const useSignInModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { login } = useAuth();

  const showSignInModal = () => {
    setIsOpen(true);
  };

  const hideSignInModal = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    showSignInModal,
    hideSignInModal,
  };
};
