import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActivityIcon, CheckIcon, XIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PasswordStrengthAnalyzerProps {
  password: string;
}

const PasswordStrengthAnalyzer: React.FC<PasswordStrengthAnalyzerProps> = ({ password }) => {
  const isMobile = useIsMobile();
  
  const getPasswordStrength = () => {
    if (!password) return "weak";
    
    const length = password.length;
    let typesCount = 0;
    
    if (/[a-z]/.test(password)) typesCount++;
    if (/[A-Z]/.test(password)) typesCount++;
    if (/[0-9]/.test(password)) typesCount++;
    if (/[^a-zA-Z0-9]/.test(password)) typesCount++;
    
    if (length < 8) return "weak";
    if (length < 12) return typesCount >= 3 ? "moderate" : "weak";
    if (length < 16) return typesCount >= 3 ? "strong" : "moderate";
    return typesCount >= 3 ? "very-strong" : "strong";
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    switch (strength) {
      case "weak": return "bg-zinc-300 dark:bg-zinc-700";
      case "moderate": return "bg-zinc-500";
      case "strong": return "bg-zinc-800 dark:bg-zinc-300";
      case "very-strong": return "bg-zinc-950 dark:bg-zinc-50";
      default: return "bg-zinc-200 dark:bg-zinc-800";
    }
  };

  const getPasswordScore = () => {
    const strength = getPasswordStrength();
    switch (strength) {
      case "weak": return 25;
      case "moderate": return 50;
      case "strong": return 75;
      case "very-strong": return 100;
      default: return 0;
    }
  };

  const hasMinLength = password.length >= 12;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const hasNoRepeatingChars = !/(.)\1\1/.test(password);
  const hasNoCommonPatterns = !/^(?:123456|password|qwerty)/i.test(password);
  
  const getTimeToCrack = () => {
    if (!password) return "Instantly";
    
    const charsetSize = 
      (hasLowercase ? 26 : 0) + 
      (hasUppercase ? 26 : 0) + 
      (hasNumber ? 10 : 0) + 
      (hasSymbol ? 33 : 0);
    
    const combinations = Math.pow(charsetSize, password.length);
    const attemptsPerSecond = 1000000000;
    const seconds = combinations / attemptsPerSecond;
    
    if (seconds < 1) return "Instantly";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 315360000) return `${Math.round(seconds / 31536000)} years`;
    
    return "Centuries";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={`h-9 border-border/50 hover:bg-secondary/60 ${isMobile ? "w-9 p-0" : ""}`}>
          <ActivityIcon className={`h-4 w-4 ${!isMobile && "mr-2 text-primary animate-pulse"}`} />
          {!isMobile && "Analyze Strength"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border border-border/40 shadow-2xl">
        <DialogHeader className="border-b border-border/20 pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ActivityIcon className="h-5 w-5 text-primary" />
            Password Strength Analysis
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/85 text-xs">
            Detailed security breakdown of your password
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {password ? (
            <>
              <div className="space-y-3 bg-secondary/20 p-3 rounded-lg border border-border/20">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-mono text-muted-foreground">OVERALL_RATING</span>
                  <span className="text-xs font-mono font-bold capitalize text-primary">
                    {getPasswordStrength().replace("-", " ")}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-secondary/80 rounded-full border border-border/30 p-0.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${getPasswordStrengthColor()} shadow-[0_0_8px_currentColor]`}
                    style={{ width: `${getPasswordScore()}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-2 font-mono flex justify-between">
                  <span className="text-muted-foreground">CRACK_TIME_EST:</span>
                  <span className="font-semibold text-foreground">{getTimeToCrack()}</span>
                </p>
              </div>
              
              <div className="space-y-3 bg-secondary/15 p-3 rounded-lg border border-border/20">
                <h4 className="text-xs font-mono tracking-wider font-semibold text-muted-foreground">SECURITY_CRITERIA</h4>
                <div className="space-y-2.5">
                  <div className="flex items-center">
                    {hasMinLength ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">At least 12 characters</span>
                  </div>
                  <div className="flex items-center">
                    {hasLowercase ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">Contains lowercase letters</span>
                  </div>
                  <div className="flex items-center">
                    {hasUppercase ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">Contains uppercase letters</span>
                  </div>
                  <div className="flex items-center">
                    {hasNumber ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">Contains numbers</span>
                  </div>
                  <div className="flex items-center">
                    {hasSymbol ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">Contains symbols</span>
                  </div>
                  <div className="flex items-center">
                    {hasNoRepeatingChars ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">No repeating characters</span>
                  </div>
                  <div className="flex items-center">
                    {hasNoCommonPatterns ? (
                      <CheckIcon className="h-4 w-4 text-foreground mr-2.5" />
                    ) : (
                      <XIcon className="h-4 w-4 text-foreground/35 mr-2.5" />
                    )}
                    <span className="text-xs font-medium text-foreground/90">No common patterns</span>
                  </div>
                </div>
              </div>
              
              <div className="text-[10px] text-muted-foreground/75 leading-relaxed bg-secondary/10 p-2.5 rounded border border-border/10 font-mono">
                <p>
                  // NOTE: This analysis is a local heuristic estimate. Strength depends on actual complexity, absence of dictionary words, and your target platform requirements.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-10 font-mono text-xs text-muted-foreground">
              [ NO_ACTIVE_PASSWORD_FOUND ]
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordStrengthAnalyzer;
