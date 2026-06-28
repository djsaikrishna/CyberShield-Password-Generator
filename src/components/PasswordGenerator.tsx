import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { 
  CheckIcon, 
  ClipboardCopy, 
  Eye, 
  EyeOff, 
  RefreshCw,
  ChevronDown,
  Info,
  ShieldCheck,
  Heart,
  Pin
} from "lucide-react";
import { toast } from "sonner";
import { convertToLeetSpeak, createMixedPassword } from "@/utils/leetSpeakConverter";
import { generatePronounceablePassword } from "@/utils/pronounceableGenerator";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import PasswordHistory from "./PasswordHistory";
import PasswordFavorites from "./PasswordFavorites";
import PasswordCategories from "./PasswordCategories";
import PasswordStrengthAnalyzer from "./PasswordStrengthAnalyzer";
import PasswordExportImport from "./PasswordExportImport";
import PasswordQRCode from "./PasswordQRCode";
import PasswordExpiryTimer from "./PasswordExpiryTimer";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useResponsiveGap } from "@/hooks/use-responsive-gap";

interface PasswordSettings {
  length: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
  requireAllTypes: boolean;
  avoidRepeating: boolean;
  usePronounceable: boolean;
}

interface PinSettings {
  length: number;
  avoidRepeating: boolean;
}

const PasswordGenerator = () => {
  const [settings, setSettings] = useState<PasswordSettings>({
    length: 16,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
    requireAllTypes: true,
    avoidRepeating: false,
    usePronounceable: false,
  });

  const [pinSettings, setPinSettings] = useState<PinSettings>({
    length: 6,
    avoidRepeating: false,
  });

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [securityTipsOpen, setSecurityTipsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "moderate" | "strong" | "very-strong">("strong");
  
  const [baseText, setBaseText] = useState("");
  const [leetPassword, setLeetPassword] = useState("");
  const [activeTab, setActiveTab] = useState("random");
  const [pin, setPin] = useState("");
  const [scramblePassword, setScramblePassword] = useState("");
  const [isScrambling, setIsScrambling] = useState(false);
  const { gap } = useResponsiveGap();
  const isMobile = useIsMobile();

  const [passwordHistory, setPasswordHistory] = useState<Array<{
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }>>([]);

  const [passwordFavorites, setPasswordFavorites] = useState<Array<{
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }>>([]);

  const [selectedCategory, setSelectedCategory] = useState("");

  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()-_=+";
  const ambiguousChars = "iIl1Lo0O";

  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return "weak";
    
    const length = pwd.length;
    let typesCount = 0;
    
    if (/[a-z]/.test(pwd)) typesCount++;
    if (/[A-Z]/.test(pwd)) typesCount++;
    if (/[0-9]/.test(pwd)) typesCount++;
    if (/[^a-zA-Z0-9]/.test(pwd)) typesCount++;
    
    if (length < 8) return "weak";
    if (length < 12) return typesCount >= 3 ? "moderate" : "weak";
    if (length < 16) return typesCount >= 3 ? "strong" : "moderate";
    return typesCount >= 3 ? "very-strong" : "strong";
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "weak": return "bg-zinc-300 dark:bg-zinc-700";
      case "moderate": return "bg-zinc-500";
      case "strong": return "bg-zinc-800 dark:bg-zinc-300";
      case "very-strong": return "bg-zinc-950 dark:bg-zinc-50";
      default: return "bg-zinc-200 dark:bg-zinc-800";
    }
  };

  const runScrambleAnimation = (finalValue: string, isNumeric = false, callback: (val: string) => void) => {
    setIsScrambling(true);
    let count = 0;
    const maxScrambles = 10;
    const chars = isNumeric ? "0123456789" : lowercaseChars + uppercaseChars + numberChars + symbolChars;
    
    const interval = setInterval(() => {
      let temp = "";
      for (let i = 0; i < finalValue.length; i++) {
        temp += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setScramblePassword(temp);
      count++;
      
      if (count >= maxScrambles) {
        clearInterval(interval);
        setScramblePassword("");
        setIsScrambling(false);
        callback(finalValue);
      }
    }, 25);
  };

  const generateRandomPassword = () => {
    try {
      if (settings.usePronounceable) {
        const pronounceablePassword = generatePronounceablePassword(
          settings.length,
          settings.includeUppercase,
          settings.includeNumbers,
          settings.includeSymbols
        );
        
        const strength = calculatePasswordStrength(pronounceablePassword);
        setPasswordStrength(strength);
        
        runScrambleAnimation(pronounceablePassword, false, (final) => {
          setPassword(final);
          toast.success("Pronounceable password generated successfully!");
        });
        return;
      }
      
      if (
        !settings.includeLowercase &&
        !settings.includeUppercase &&
        !settings.includeNumbers &&
        !settings.includeSymbols
      ) {
        toast.error("Please select at least one character type");
        return;
      }

      let availableChars = "";
      const mustIncludeChars = [];

      if (settings.includeLowercase) {
        availableChars += lowercaseChars;
        mustIncludeChars.push(lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length)));
      }

      if (settings.includeUppercase) {
        availableChars += uppercaseChars;
        mustIncludeChars.push(uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length)));
      }

      if (settings.includeNumbers) {
        availableChars += numberChars;
        mustIncludeChars.push(numberChars.charAt(Math.floor(Math.random() * numberChars.length)));
      }

      if (settings.includeSymbols) {
        availableChars += symbolChars;
        mustIncludeChars.push(symbolChars.charAt(Math.floor(Math.random() * symbolChars.length)));
      }

      if (settings.excludeAmbiguous) {
        for (const char of ambiguousChars) {
          availableChars = availableChars.replace(char, "");
        }
      }

      let result = "";
      const length = settings.length;

      if (settings.requireAllTypes && mustIncludeChars.length > 0) {
        result = mustIncludeChars.join("");
        
        for (let i = result.length; i < length; i++) {
          const nextChar = availableChars.charAt(Math.floor(Math.random() * availableChars.length));
          
          if (settings.avoidRepeating && result.includes(nextChar)) {
            let attemptCount = 0;
            let uniqueChar = nextChar;
            
            while (result.includes(uniqueChar) && attemptCount < 10) {
              uniqueChar = availableChars.charAt(Math.floor(Math.random() * availableChars.length));
              attemptCount++;
            }
            
            result += uniqueChar;
          } else {
            result += nextChar;
          }
        }
        
        result = result.split("").sort(() => 0.5 - Math.random()).join("");
      } else {
        for (let i = 0; i < length; i++) {
          const nextChar = availableChars.charAt(Math.floor(Math.random() * availableChars.length));
          
          if (settings.avoidRepeating && result.includes(nextChar)) {
            let attemptCount = 0;
            let uniqueChar = nextChar;
            
            while (result.includes(uniqueChar) && attemptCount < 10) {
              uniqueChar = availableChars.charAt(Math.floor(Math.random() * availableChars.length));
              attemptCount++;
            }
            
            result += uniqueChar;
          } else {
            result += nextChar;
          }
        }
      }

      const strength = calculatePasswordStrength(result);
      setPasswordStrength(strength);
      
      runScrambleAnimation(result, false, (final) => {
        setPassword(final);
        toast.success("Password generated successfully!");
      });
    } catch (error) {
      console.error("Password generation error:", error);
      toast.error("Failed to generate password");
    }
  };

  const generateLeetPassword = () => {
    if (!baseText) {
      toast.error("Please enter some text first");
      return;
    }
    
    const mixedPassword = createMixedPassword(
      baseText,
      settings.length,
      settings.includeLowercase,
      settings.includeUppercase,
      settings.includeNumbers,
      settings.includeSymbols,
      settings.excludeAmbiguous
    );
    
    const strength = calculatePasswordStrength(mixedPassword);
    setPasswordStrength(strength);
    
    runScrambleAnimation(mixedPassword, false, (final) => {
      setLeetPassword(final);
      toast.success("Password created successfully!");
    });
  };

  const generatePin = () => {
    try {
      const length = pinSettings.length;
      let result = "";
      
      for (let i = 0; i < length; i++) {
        const nextDigit = Math.floor(Math.random() * 10).toString();
        
        if (pinSettings.avoidRepeating && result.includes(nextDigit)) {
          let attemptCount = 0;
          let uniqueDigit = nextDigit;
          
          while (result.includes(uniqueDigit) && attemptCount < 10) {
            uniqueDigit = Math.floor(Math.random() * 10).toString();
            attemptCount++;
          }
          
          result += uniqueDigit;
        } else {
          result += nextDigit;
        }
      }
      
      const strength = length < 6 ? "weak" : length < 8 ? "moderate" : "strong";
      setPasswordStrength(strength);
      
      runScrambleAnimation(result, true, (final) => {
        setPin(final);
        toast.success("PIN generated successfully!");
      });
    } catch (error) {
      console.error("PIN generation error:", error);
      toast.error("Failed to generate PIN");
    }
  };

  const copyToClipboard = () => {
    let textToCopy = activeTab === "random" ? password : 
                    activeTab === "leet" ? leetPassword : pin;
    
    if (!textToCopy) {
      toast.error("Generate a password first!");
      return;
    }
    
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopied(true);
        toast.success("Password copied to clipboard!");
        
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      },
      () => {
        toast.error("Failed to copy password");
      }
    );
  };

  const clearHistory = () => {
    setPasswordHistory([]);
    toast.success("Password history cleared");
  };

  const clearFavorites = () => {
    setPasswordFavorites([]);
    toast.success("Favorites cleared");
  };

  const addToFavorites = (passwordItem: {
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }) => {
    if (passwordFavorites.some(item => item.password === passwordItem.password)) {
      toast.info("Password already in favorites");
      return;
    }

    setPasswordFavorites(prev => [
      {
        ...passwordItem,
        category: passwordItem.category || selectedCategory || "uncategorized"
      },
      ...prev
    ]);
    
    toast.success("Added to favorites");
  };

  const removeFromFavorites = (index: number) => {
    setPasswordFavorites(prev => prev.filter((_, i) => i !== index));
    toast.success("Removed from favorites");
  };

  const handleImportPasswords = (importedPasswords: Array<any>) => {
    const existingPasswords = new Set(passwordHistory.map(p => p.password));
    const newPasswords = importedPasswords.filter(p => !existingPasswords.has(p.password));
    
    setPasswordHistory(prev => [
      ...newPasswords,
      ...prev
    ].slice(0, 100));
  };

  const addCurrentPasswordToFavorites = () => {
    const currentPassword = activeTab === "random" ? password : 
                           activeTab === "leet" ? leetPassword : pin;
    
    if (!currentPassword) {
      toast.error("Generate a password first!");
      return;
    }

    addToFavorites({
      password: currentPassword,
      timestamp: new Date(),
      strength: passwordStrength,
      type: activeTab as "random" | "leet" | "pin",
      category: selectedCategory || "uncategorized"
    });
  };

  const saveToHistory = () => {
    const currentPassword = activeTab === "random" ? password : 
                           activeTab === "leet" ? leetPassword : pin;
    
    if (!currentPassword) {
      toast.error("Generate a password first!");
      return;
    }

    setPasswordHistory(prev => [
      {
        password: currentPassword,
        timestamp: new Date(),
        strength: passwordStrength,
        type: activeTab as "random" | "leet" | "pin",
        category: selectedCategory || "uncategorized"
      },
      ...prev.slice(0, 19)
    ]);
    
    toast.success("Added to history");
  };

  const handlePasswordExpiry = () => {
    if (activeTab === "random") {
      setPassword("");
    } else if (activeTab === "leet") {
      setLeetPassword("");
    } else {
      setPin("");
    }
  };

  const shortcuts = [
    {
      key: "g",
      description: "Generate new password/PIN",
      action: () => {
        if (activeTab === "random") {
          generateRandomPassword();
        } else if (activeTab === "leet") {
          generateLeetPassword();
        } else {
          generatePin();
        }
      }
    },
    {
      key: "c",
      description: "Copy to clipboard",
      action: copyToClipboard
    },
    {
      key: "s",
      description: "Toggle visibility",
      action: () => setShowPassword(!showPassword)
    },
    {
      key: "f",
      description: "Add to favorites",
      action: addCurrentPasswordToFavorites
    },
    {
      key: "h",
      description: "Save to history",
      action: saveToHistory
    },
    {
      key: "1",
      description: "Switch to Random tab",
      action: () => setActiveTab("random")
    },
    {
      key: "2",
      description: "Switch to Text to Password tab",
      action: () => setActiveTab("leet")
    },
    {
      key: "3",
      description: "Switch to PIN Generator tab",
      action: () => setActiveTab("pin")
    }
  ];

  const { isListening, toggleListening } = useKeyboardShortcuts(shortcuts);

  useEffect(() => {
    // Empty useEffect to avoid automatic password generation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatConsolePassword = (pwd: string, placeholderText: string) => {
    const displayValue = isScrambling ? scramblePassword : pwd;
    
    if (!displayValue) {
      return (
        <span className="text-muted-foreground/50 font-sans text-sm sm:text-base">
          {placeholderText}
        </span>
      );
    }
    
    if (!showPassword && !isScrambling) {
      return (
        <span className="tracking-widest font-mono text-lg sm:text-xl text-primary/80 select-none">
          {"•".repeat(displayValue.length)}
        </span>
      );
    }
    
    return (
      <span className="font-mono text-lg sm:text-xl break-all">
        {displayValue.split("").map((char, index) => {
          if (/[a-z]/.test(char)) return <span key={index} className="char-lowercase">{char}</span>;
          if (/[A-Z]/.test(char)) return <span key={index} className="char-uppercase">{char}</span>;
          if (/[0-9]/.test(char)) return <span key={index} className="char-number">{char}</span>;
          return <span key={index} className="char-symbol">{char}</span>;
        })}
      </span>
    );
  };

  const currentPassword = activeTab === "random" ? password : 
                         activeTab === "leet" ? leetPassword : pin;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="bg-card border border-border/80 shadow-lg rounded-2xl relative overflow-hidden">
        <CardHeader className="space-y-1.5 border-b border-border/60 pb-4 pt-6">
          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-center relative flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 mr-2.5 text-primary" />
            <span>Generate Secure Password</span>
          </CardTitle>
          <p className="text-center text-muted-foreground text-xs sm:text-sm">
            Create strong, cryptographic passwords or PINs instantly
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          <Tabs 
            defaultValue="random" 
            className="w-full"
            onValueChange={(value) => setActiveTab(value)}
            value={activeTab}
          >
            <TabsPrimitive.List className="segmented-tabs-list mb-6">
              <TabsPrimitive.Trigger 
                value="random" 
                className="segmented-tab-trigger"
              >
                Random Password
              </TabsPrimitive.Trigger>
              <TabsPrimitive.Trigger 
                value="leet" 
                className="segmented-tab-trigger"
              >
                Text to Password
              </TabsPrimitive.Trigger>
              <TabsPrimitive.Trigger 
                value="pin" 
                className="segmented-tab-trigger"
              >
                PIN Generator
              </TabsPrimitive.Trigger>
            </TabsPrimitive.List>
            
            <div className="w-full">
              <div className="flex items-center justify-between mb-4 bg-secondary/35 p-2 rounded-xl border border-border/40">
                <div className={`flex items-center ${gap}`}>
                  <PasswordHistory 
                    history={passwordHistory}
                    onClearHistory={clearHistory}
                    onCopyPassword={(pwd) => {
                      navigator.clipboard.writeText(pwd).then(
                        () => toast.success("Password copied to clipboard!"),
                        () => toast.error("Failed to copy password")
                      );
                    }}
                    onAddToFavorites={addToFavorites}
                    favorites={passwordFavorites}
                  />
                  <PasswordFavorites
                    favorites={passwordFavorites}
                    onClearFavorites={clearFavorites}
                    onCopyPassword={(pwd) => {
                      navigator.clipboard.writeText(pwd).then(
                        () => toast.success("Password copied to clipboard!"),
                        () => toast.error("Failed to copy password")
                      );
                    }}
                    onRemoveFromFavorites={removeFromFavorites}
                  />
                  <PasswordStrengthAnalyzer password={currentPassword} />
                </div>
                <div className={`flex items-center ${gap}`}>
                  {!isMobile && (
                    <KeyboardShortcuts 
                      shortcuts={shortcuts}
                      isEnabled={isListening}
                      onToggle={toggleListening}
                    />
                  )}
                  <PasswordExportImport 
                    passwordHistory={passwordHistory}
                    onImport={handleImportPasswords}
                  />
                </div>
              </div>
              
              {activeTab === "random" ? (
                <div className="relative mb-5">
                  <div className="premium-display-card flex items-center justify-between gap-3 min-h-[56px]">
                    <div className="flex-1 select-all select-text overflow-x-auto whitespace-nowrap scrollbar-none flex items-center px-1">
                      {formatConsolePassword(password, "Click 'Generate' to create a password")}
                    </div>
                    <div className="flex items-center gap-1 z-10">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-lg transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyToClipboard}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-lg transition-colors"
                      >
                        {copied ? <CheckIcon className="h-4 w-4 text-foreground animate-scaleIn" /> : <ClipboardCopy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 bg-secondary/15 p-2 rounded-xl border border-border/40">
                    <div className={`flex ${gap}`}>
                      <PasswordCategories 
                        onSelectCategory={setSelectedCategory}
                        selectedCategory={selectedCategory}
                      />
                      <PasswordQRCode password={password} />
                      <PasswordExpiryTimer 
                        password={password}
                        onPasswordExpiry={handlePasswordExpiry} 
                      />
                    </div>
                    <div className={`flex ${gap}`}>
                      <Button
                        variant="outline"
                        onClick={addCurrentPasswordToFavorites}
                        className={`${isMobile ? "w-9 h-9 p-0" : "h-9 font-semibold hover:bg-secondary/80 border-border/60"}`}
                        size="sm"
                      >
                        <Heart className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
                        {!isMobile && "Save"}
                      </Button>
                      <Button
                        onClick={generateRandomPassword}
                        className={`${isMobile ? "w-9 h-9 p-0" : "h-9 font-semibold"}`}
                        size="sm"
                      >
                        <RefreshCw className={`h-4 w-4 ${!isMobile && "mr-2"} ${isScrambling && activeTab === "random" ? "animate-spin" : ""}`} />
                        {!isMobile && "Generate"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : activeTab === "leet" ? (
                <div className="space-y-4 mb-5">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label htmlFor="base-text" className="text-xs font-semibold mb-1.5 block text-muted-foreground">Enter text to convert</Label>
                      <Input
                        id="base-text"
                        placeholder="Enter a word or phrase"
                        value={baseText}
                        onChange={(e) => setBaseText(e.target.value)}
                        className="h-10 border-border/60 focus-visible:ring-primary bg-secondary/20"
                      />
                    </div>
                    <Button
                      onClick={generateLeetPassword}
                      className={`h-10 font-semibold ${isMobile ? "w-10 h-10 p-0" : "h-10"}`}
                    >
                      <RefreshCw className={`h-4 w-4 ${!isMobile && "mr-2"} ${isScrambling && activeTab === "leet" ? "animate-spin" : ""}`} />
                      {!isMobile && "Generate"}
                    </Button>
                  </div>
                  
                  {leetPassword && (
                    <div>
                      <div className="premium-display-card flex items-center justify-between gap-3 min-h-[56px]">
                        <div className="flex-1 select-all select-text overflow-x-auto whitespace-nowrap scrollbar-none flex items-center px-1">
                          {formatConsolePassword(leetPassword, "")}
                        </div>
                        <div className="flex items-center gap-1 z-10">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-lg transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={copyToClipboard}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-lg transition-colors"
                          >
                            {copied ? <CheckIcon className="h-4 w-4 text-foreground" /> : <ClipboardCopy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 bg-secondary/15 p-2 rounded-xl border border-border/40">
                        <div className={`flex ${gap}`}>
                          <PasswordCategories 
                            onSelectCategory={setSelectedCategory}
                            selectedCategory={selectedCategory}
                          />
                          <PasswordQRCode password={leetPassword} />
                          <PasswordExpiryTimer 
                            password={leetPassword}
                            onPasswordExpiry={handlePasswordExpiry} 
                          />
                        </div>
                        <div className={`flex ${gap}`}>
                          <Button
                            variant="outline"
                            onClick={addCurrentPasswordToFavorites}
                            className={`${isMobile ? "w-9 h-9 p-0" : "h-9 font-semibold hover:bg-secondary/80 border-border/60"}`}
                            size="sm"
                          >
                            <Heart className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
                            {!isMobile && "Save"}
                          </Button>
                          <Button
                            onClick={generateLeetPassword}
                            className={`${isMobile ? "w-9 h-9 p-0" : "h-9 font-semibold"}`}
                            size="sm"
                          >
                            <RefreshCw className={`h-4 w-4 ${!isMobile && "mr-2"} ${isScrambling && activeTab === "leet" ? "animate-spin" : ""}`} />
                            {!isMobile && "Regenerate"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 mb-5">
                  <div className="relative">
                    <div className="premium-display-card flex flex-col items-center gap-3">
                      <div className="w-full flex items-center justify-center min-h-[48px]">
                        {pin || (isScrambling && activeTab === "pin") ? (
                          <div className="flex flex-wrap justify-center gap-1.5 max-w-full overflow-hidden select-none">
                            {(isScrambling ? scramblePassword : pin).split('').map((digit, index) => (
                              <div
                                key={index}
                                className="h-11 w-9 flex items-center justify-center relative font-mono"
                              >
                                <div className="absolute inset-0 bg-secondary/80 rounded-lg border border-border/80 shadow-sm" />
                                <span className="relative text-lg font-bold text-foreground z-10">
                                  {showPassword || isScrambling ? digit : '•'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-3 px-2">
                            <p className="text-muted-foreground/60 text-center text-sm">
                              Generate a PIN to see it displayed here
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between w-full border-t border-border/40 pt-2 px-1 z-10">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={copyToClipboard}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                        >
                          {copied ? <CheckIcon className="h-4 w-4 text-foreground" /> : <ClipboardCopy className="h-4 w-4" />}
                        </Button>
                        <span className="text-[10px] font-mono text-muted-foreground/60 tracking-wider">PIN_SECURE_LOCK</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 bg-secondary/15 p-2 rounded-xl border border-border/40">
                      <div className={`flex ${gap}`}>
                        <PasswordCategories 
                          onSelectCategory={setSelectedCategory}
                          selectedCategory={selectedCategory}
                        />
                        <PasswordQRCode password={pin} />
                        <PasswordExpiryTimer 
                          password={pin}
                          onPasswordExpiry={handlePasswordExpiry} 
                        />
                      </div>
                      <div className={`flex ${gap}`}>
                        <Button
                          variant="outline"
                          onClick={addCurrentPasswordToFavorites}
                          className={`${isMobile ? "w-9 h-9 p-0" : "h-9 font-semibold hover:bg-secondary/80 border-border/60"}`}
                          size="sm"
                        >
                          <Heart className={`h-4 w-4 ${!isMobile && "mr-2"}`} />
                          {!isMobile && "Save"}
                        </Button>
                        <Button
                          onClick={generatePin}
                          className={`${isMobile ? "w-9 h-9 p-0" : "h-9 font-semibold"}`}
                          size="sm"
                        >
                          <RefreshCw className={`h-4 w-4 ${!isMobile && "mr-2"} ${isScrambling && activeTab === "pin" ? "animate-spin" : ""}`} />
                          {!isMobile && "Generate"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-2 bg-secondary/15 p-3 rounded-xl border border-border/40">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-muted-foreground">PASSWORD_STRENGTH</span>
                  <span className={`capitalize font-bold ${
                    passwordStrength === "weak" ? "text-foreground/40" :
                    passwordStrength === "moderate" ? "text-foreground/70" :
                    "text-foreground"
                  }`}>
                    {passwordStrength.replace("-", " ")}
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary/60 rounded-full overflow-hidden border border-border/40 p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                    style={{ 
                      width: passwordStrength === "weak" ? "25%" : 
                             passwordStrength === "moderate" ? "50%" : 
                             passwordStrength === "strong" ? "75%" : "100%" 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            <TabsContent value="random" className="space-y-4 mt-0">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password-length" className="text-xs font-medium">Password Length</Label>
                  <span className="font-mono text-xs">{settings.length}</span>
                </div>
                <Slider
                  id="password-length"
                  min={8}
                  max={128}
                  step={1}
                  value={[settings.length]}
                  onValueChange={(value) => setSettings({ ...settings, length: value[0] })}
                  className="py-2"
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Character Types</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="lowercase" className="text-xs">Lowercase (a-z)</Label>
                    <Switch
                      id="lowercase"
                      checked={settings.includeLowercase}
                      onCheckedChange={(checked) => setSettings({ ...settings, includeLowercase: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="uppercase" className="text-xs">Uppercase (A-Z)</Label>
                    <Switch
                      id="uppercase"
                      checked={settings.includeUppercase}
                      onCheckedChange={(checked) => setSettings({ ...settings, includeUppercase: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="numbers" className="text-xs">Numbers (0-9)</Label>
                    <Switch
                      id="numbers"
                      checked={settings.includeNumbers}
                      onCheckedChange={(checked) => setSettings({ ...settings, includeNumbers: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="symbols" className="text-xs">Symbols (!@#$%^&*)</Label>
                    <Switch
                      id="symbols"
                      checked={settings.includeSymbols}
                      onCheckedChange={(checked) => setSettings({ ...settings, includeSymbols: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="ambiguous" className="text-xs">Exclude Ambiguous (iIl1Lo0O)</Label>
                    <Switch
                      id="ambiguous"
                      checked={settings.excludeAmbiguous}
                      onCheckedChange={(checked) => setSettings({ ...settings, excludeAmbiguous: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="pronounceable" className="text-xs">Pronounceable Password</Label>
                    <Switch
                      id="pronounceable"
                      checked={settings.usePronounceable}
                      onCheckedChange={(checked) => setSettings({ ...settings, usePronounceable: checked })}
                    />
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Advanced Options</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="all-types" className="text-xs">Require All Selected Types</Label>
                    <Switch
                      id="all-types"
                      checked={settings.requireAllTypes}
                      onCheckedChange={(checked) => setSettings({ ...settings, requireAllTypes: checked })}
                      disabled={settings.usePronounceable}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="avoid-repeating" className="text-xs">Avoid Repeating Characters</Label>
                    <Switch
                      id="avoid-repeating"
                      checked={settings.avoidRepeating}
                      onCheckedChange={(checked) => setSettings({ ...settings, avoidRepeating: checked })}
                      disabled={settings.usePronounceable}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="leet" className="space-y-4 mt-0">
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Enter a memorable word or phrase that will be converted to a secure password. 
                  We'll mix it with random characters to reach your desired length.
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="leet-password-length" className="text-xs font-medium">Password Length</Label>
                    <span className="font-mono text-xs">{settings.length}</span>
                  </div>
                  <Slider
                    id="leet-password-length"
                    min={8}
                    max={128}
                    step={1}
                    value={[settings.length]}
                    onValueChange={(value) => setSettings({ ...settings, length: value[0] })}
                    className="py-2"
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Character Types (for random part)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="leet-lowercase" className="text-xs">Lowercase (a-z)</Label>
                      <Switch
                        id="leet-lowercase"
                        checked={settings.includeLowercase}
                        onCheckedChange={(checked) => setSettings({ ...settings, includeLowercase: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="leet-uppercase" className="text-xs">Uppercase (A-Z)</Label>
                      <Switch
                        id="leet-uppercase"
                        checked={settings.includeUppercase}
                        onCheckedChange={(checked) => setSettings({ ...settings, includeUppercase: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="leet-numbers" className="text-xs">Numbers (0-9)</Label>
                      <Switch
                        id="leet-numbers"
                        checked={settings.includeNumbers}
                        onCheckedChange={(checked) => setSettings({ ...settings, includeNumbers: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="leet-symbols" className="text-xs">Symbols (!@#$%^&*)</Label>
                      <Switch
                        id="leet-symbols"
                        checked={settings.includeSymbols}
                        onCheckedChange={(checked) => setSettings({ ...settings, includeSymbols: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="leet-ambiguous" className="text-xs">Exclude Ambiguous (iIl1Lo0O)</Label>
                      <Switch
                        id="leet-ambiguous"
                        checked={settings.excludeAmbiguous}
                        onCheckedChange={(checked) => setSettings({ ...settings, excludeAmbiguous: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pin" className="space-y-4 mt-0">
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Generate a secure PIN code with your desired length. Great for device unlock codes, ATM PINs, and other numeric access needs.
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="pin-length" className="text-xs font-medium">PIN Length</Label>
                    <span className="font-mono text-xs">{pinSettings.length}</span>
                  </div>
                  <Slider
                    id="pin-length"
                    min={4}
                    max={12}
                    step={1}
                    value={[pinSettings.length]}
                    onValueChange={(value) => setPinSettings({ ...pinSettings, length: value[0] })}
                    className="py-2"
                  />
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">PIN Options</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="avoid-repeating-pin" className="text-xs">Avoid Repeating Digits</Label>
                      <Switch
                        id="avoid-repeating-pin"
                        checked={pinSettings.avoidRepeating}
                        onCheckedChange={(checked) => setPinSettings({ ...pinSettings, avoidRepeating: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator />
          
          <Collapsible
            open={securityTipsOpen}
            onOpenChange={setSecurityTipsOpen}
            className="space-y-2 bg-secondary/10 hover:bg-secondary/20 transition-colors border border-border/20 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary animate-pulse" />
                <h3 className="font-semibold text-sm tracking-wide text-foreground/90">PASSWORD SECURITY TIPS</h3>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full hover:bg-secondary/40">
                  <span className="sr-only">Toggle</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${securityTipsOpen ? "rotate-180 text-primary" : ""}`} />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2 pt-3 border-t border-border/10 mt-2">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground/90 font-sans list-none">
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Use at least 12 characters for strong security</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Combine uppercase, lowercase, numbers, and symbols</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Avoid using personal information</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Use unique passwords for each account</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Consider using a password manager</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Pronounceable passwords can be easier to remember but may be less secure</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Use keyboard shortcuts to quickly generate passwords</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Set expiry timers for temporary passwords</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> For PINs, avoid common sequences like 1234 or 0000</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span> Longer PINs (8+ digits) provide much better security</li>
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordGenerator;
