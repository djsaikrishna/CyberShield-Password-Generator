
import React from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  ClipboardCopy, 
  BookmarkCheck, 
  Trash2, 
  Eye, 
  EyeOff,
  X,
  CheckIcon,
  Tag
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface PasswordFavoritesProps {
  favorites: Array<{
    password: string;
    timestamp: Date;
    strength: "weak" | "moderate" | "strong" | "very-strong";
    type: "random" | "leet" | "pin";
    category?: string;
  }>;
  onClearFavorites: () => void;
  onCopyPassword: (password: string) => void;
  onRemoveFromFavorites: (index: number) => void;
}

const PasswordFavorites: React.FC<PasswordFavoritesProps> = ({
  favorites,
  onClearFavorites,
  onCopyPassword,
  onRemoveFromFavorites
}) => {
  const [showPasswords, setShowPasswords] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const isMobile = useIsMobile();

  const handleCopy = (password: string, index: number) => {
    onCopyPassword(password);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "weak": return "bg-zinc-300 dark:bg-zinc-700";
      case "moderate": return "bg-zinc-500";
      case "strong": return "bg-zinc-800 dark:bg-zinc-300";
      case "very-strong": return "bg-zinc-950 dark:bg-zinc-50";
      default: return "bg-zinc-200 dark:bg-zinc-800";
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9 border-border/50 hover:bg-secondary/60">
          <BookmarkCheck className="h-4 w-4" />
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold px-1 animate-pulse">
              {favorites.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto bg-background/95 backdrop-blur-md border-l border-border/40 text-foreground">
        <SheetHeader className="mb-4 border-b border-border/20 pb-3">
          <SheetTitle className="flex justify-between items-center text-lg font-bold">
            <span>Favorite Passwords</span>
            <div className="flex space-x-1.5 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswords(!showPasswords)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              {favorites.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onClearFavorites}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 font-mono text-xs text-muted-foreground">
            [ NO_FAVORITE_RECORDS ]
          </div>
        ) : (
          <div className="space-y-3.5">
            {favorites.map((item, index) => (
              <div
                key={index}
                className="p-3 border border-border/20 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-all duration-300 relative group shadow-sm"
              >
                <div className="flex justify-between items-center mb-1.5 font-mono">
                  <span className="text-[10px] opacity-60">
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {item.category && item.category !== "uncategorized" && (
                      <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full flex items-center">
                        <Tag className="h-2.5 w-2.5 mr-1" />
                        {item.category}
                      </span>
                    )}
                    <span className="text-[10px] capitalize bg-secondary/60 border border-border/20 px-2 py-0.5 rounded-full">
                      {item.type}
                    </span>
                  </div>
                </div>
                <div className="font-mono bg-secondary border border-border/80 rounded-lg p-2.5 mb-2 overflow-x-auto select-all">
                  {showPasswords ? (
                    <code className="text-xs break-all text-foreground">{item.password}</code>
                  ) : (
                    <code className="text-xs tracking-widest text-muted-foreground/60 select-none">••••••••••••••••</code>
                  )}
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-border/10">
                  <div className="flex items-center space-x-2">
                    <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden border border-border/20 p-0">
                      <div
                        className={`h-full ${getStrengthColor(item.strength)}`}
                        style={{
                          width:
                            item.strength === "weak"
                              ? "25%"
                              : item.strength === "moderate"
                              ? "50%"
                              : item.strength === "strong"
                              ? "75%"
                              : "100%",
                        }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono capitalize">{item.strength.replace("-", " ")}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(item.password, index)}
                      className="h-7 px-2 hover:bg-secondary/40"
                    >
                      {copiedIndex === index ? (
                        <CheckIcon className="h-3.5 w-3.5 text-foreground" />
                      ) : (
                        <ClipboardCopy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFromFavorites(index)}
                      className="h-7 px-2 hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PasswordFavorites;
