import { useCallback } from "react";

export const useConfetti = () => {
  const triggerConfetti = useCallback(() => {
    // Simple confetti effect
    if (typeof window !== 'undefined') {
      console.log("🎉 Confetti time!");
    }
  }, []);

  return { triggerConfetti };
};
