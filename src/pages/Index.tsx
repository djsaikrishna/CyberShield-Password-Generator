import React, { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import PasswordGenerator from "@/components/PasswordGenerator";
import Preloader from "@/components/Preloader";
import ExtensionPromotion from "@/components/ExtensionPromotion";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [isDark, setIsDark] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Initialize the isDark state based on document class on first render
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const handleThemeChange = (isDarkMode: boolean) => {
    setIsDark(isDarkMode);
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <Preloader />
      
      {/* Soft neutral grayscale backdrop glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[50%] h-[40%] rounded-full bg-foreground/5 blur-[120px]" />
      </div>

      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 relative z-10">
        <header className="border-b border-border/50 sticky top-0 backdrop-blur-md bg-background/60 z-20">
          <div className="container mx-auto py-3 px-4 sm:py-3.5 sm:px-6 flex justify-between items-center">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="bg-secondary border border-border/60 p-1.5 rounded-xl transition-all duration-300 group-hover:border-primary/50">
                <img 
                  src={isDark ? "/favicon.png" : "/favicon-dark.png"} 
                  alt="CyberKeyGen Logo" 
                  className="w-6 h-6 transition-transform duration-300 group-hover:scale-105" 
                />
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                CyberKeyGen
              </h1>
            </div>
            <ThemeToggle onThemeChange={handleThemeChange} />
          </div>
        </header>

        <main className="container mx-auto pt-6 pb-10 px-4 sm:py-12 sm:px-6 flex-grow flex items-center justify-center">
          <PasswordGenerator />
        </main>
        
        {/* Extension promotion for desktop users */}
        {!isMobile && <ExtensionPromotion isDark={isDark} />}

        <footer className="py-4 border-t border-border/40 bg-background/60 backdrop-blur-md z-20">
          <div className="container mx-auto px-4 text-center text-xs text-muted-foreground tracking-wide font-sans">
            <p className="whitespace-normal">
              © 2026 CyberKeyGen • Created by{" "}
              <a 
                href="https://karthiklal.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors underline decoration-border hover:decoration-primary"
              >
                KARTHIK LAL
              </a>
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Index;
