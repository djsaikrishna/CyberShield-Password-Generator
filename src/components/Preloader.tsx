import React, { useEffect, useState } from "react";
import { Key } from "lucide-react";

const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("INITIALIZING SECURITY CORE...");
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // Phase texts
    const statuses = [
      "ESTABLISHING ENCRYPTION LAYER...",
      "GENERATING ENTROPY POOL...",
      "MOUNTING CRYPTO ENGINE...",
      "READY."
    ];

    let statusIdx = 0;
    const textInterval = setInterval(() => {
      if (statusIdx < statuses.length) {
        setLoadingText(statuses[statusIdx]);
        statusIdx++;
      }
    }, 400);

    const percentInterval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(percentInterval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 100);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1600); // slightly longer to feel like a real security system boot

    return () => {
      clearInterval(textInterval);
      clearInterval(percentInterval);
      clearTimeout(timer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="soft-loader">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo wrapper */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary border border-border/80 p-3 shadow-md animate-pulse">
          <img 
            src="/favicon.png" 
            alt="CyberKeyGen Logo Light" 
            className="w-10 h-10 transition-transform duration-300 animate-spin [animation-duration:10s] hidden dark:block" 
          />
          <img 
            src="/favicon-dark.png" 
            alt="CyberKeyGen Logo Dark" 
            className="w-10 h-10 transition-transform duration-300 animate-spin [animation-duration:10s] block dark:hidden" 
          />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
