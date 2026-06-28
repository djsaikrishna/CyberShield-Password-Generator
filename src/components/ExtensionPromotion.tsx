import React, { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ExtensionPromotionProps {
  isDark: boolean;
}

const ExtensionPromotion: React.FC<ExtensionPromotionProps> = ({ isDark }) => {
  // Ensure it's always visible for now by setting a default of true
  const [isVisible, setIsVisible] = useState(true);
  const [initialized, setInitialized] = useState(true); // Start as initialized
  
  useEffect(() => {
    // For testing purposes, we'll force the banner to be visible
    // by clearing any previous dismissal
    try {
      localStorage.removeItem("extensionBannerDismissed");
      setIsVisible(true);
      setInitialized(true);
    } catch (error) {
      // If there's any error with localStorage, keep the banner visible
      console.error("Error accessing localStorage:", error);
    }
  }, []);
  
  const handleDismiss = () => {
    setIsVisible(false);
    try {
      // Save the dismissal in localStorage
      localStorage.setItem("extensionBannerDismissed", "true");
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };
  
  const handleInstall = () => {
    window.open("https://github.com/karthik558/CyberKeyGen/releases", "_blank", "noopener,noreferrer");
  };
  
  // Don't render anything until we've checked localStorage
  // This prevents the flash of content before hiding
  if (!initialized || !isVisible) return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Card className="p-4 bg-card border border-border/80 max-w-[300px] rounded-2xl shadow-lg hover:border-foreground/30 transition-colors animate-in slide-in-from-bottom-5 duration-500">
        <div className="flex justify-end">
          <button 
            onClick={handleDismiss}
            className="text-muted-foreground/60 hover:text-foreground transition-colors"
            aria-label="Close promotion"
          >
            <X size={15} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 mb-3 mt-1">
          <div className="bg-secondary border border-border/60 p-2 rounded-xl">
            <img 
              src={isDark ? "/favicon.png" : "/favicon-dark.png"} 
              alt="CyberKeyGen Extension" 
              className="w-6 h-6" 
            />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide text-foreground">Browser Extension</h3>
            <span className="text-[10px] text-muted-foreground font-mono tracking-widest font-bold">EXTENSION_ADDON</span>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground/90 mb-3 leading-relaxed">
          Generate secure passwords directly from your browser's toolbar!
        </p>
        
        <p className="text-[10px] text-muted-foreground/60 mb-4 italic">
          * Never leave your active page to create strong passwords
        </p>
        
        <Button 
          variant="default" 
          onClick={handleInstall} 
          className="w-full py-2 h-9 font-semibold bg-primary text-primary-foreground hover:opacity-85 shadow-sm transition-all duration-300"
        >
          <Download size={14} className="mr-2" /> Install Now
        </Button>
      </Card>
    </div>
  );
};

export default ExtensionPromotion;
