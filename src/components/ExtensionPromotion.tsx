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
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="p-4 shadow-md border border-primary/70 bg-background/95 backdrop-blur-sm max-w-[300px] animate-in slide-in-from-right duration-300">
        <div className="flex justify-end">
          <button 
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close promotion"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 mb-3 mt-1">
          <div className="bg-primary/20 p-2 rounded-full">
            <img 
              src={isDark ? "/favicon.png" : "/favicon-dark.png"} 
              alt="CyberKeyGen Extension" 
              className="w-6 h-6" 
            />
          </div>
          <h3 className="font-semibold text-base">Browser Extension</h3>
        </div>
        
        <p className="text-sm text-foreground mb-2">
          Generate secure passwords directly from your browser's toolbar!
        </p>
        
        <p className="text-xs text-muted-foreground mb-4">
          Never leave your current page to create strong passwords
        </p>
        
        <Button 
          variant="default" 
          onClick={handleInstall} 
          className="w-full py-2 h-9 font-medium"
        >
          <Download size={16} className="mr-2" /> Install Now
        </Button>
      </Card>
    </div>
  );
};

export default ExtensionPromotion;
