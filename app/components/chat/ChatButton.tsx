"use client";

import { X, Sparkles } from "lucide-react";
import { useAtom } from "jotai";
import { chatOpenAtom, chatMessagesAtom } from "@/store/chat.atom";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { cn } from "@/lib/utils/utils";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

/**
 * Floating chat button component
 * Shows on all pages with badge for unread messages
 */
export function ChatButton() {
  const [isOpen, setIsOpen] = useAtom(chatOpenAtom);
  const [messages] = useAtom(chatMessagesAtom);
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has seen the animation in this session
    const hasSeen = sessionStorage.getItem("hasSeenChatAnimation");
    if (!hasSeen) {
      setIsAnimating(true);
    }
  }, []);

  const handleClick = () => {
    // Stop animation and mark as seen when clicked
    if (isAnimating) {
      setIsAnimating(false);
      sessionStorage.setItem("hasSeenChatAnimation", "true");
    }
    setIsOpen(!isOpen);
  };

  // Count assistant messages (AI responses)
  const hasMessages = messages.length > 0;

  return (
    <div
      className="fixed right-4 z-50"
      style={{ bottom: "calc(4rem + var(--combo-actionbar-height, 0px))" }}
    >
      <Button
        size="sm"
        onClick={handleClick}
        className={cn(
          "h-10 w-10 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          isOpen && "scale-95",
          isAnimating && "animate-ai-pulse ring-2 ring-primary/50 ring-offset-2 scale-110"
        )}
      >
        {isOpen ? (
          <X className="h-8 w-8" />
        ) : (
          <div className="relative">
            <Sparkles className={cn("h-6 w-6", isAnimating && "animate-ai-spin")} />
            {hasMessages && !isAnimating && (
              <Badge
                variant="destructive"
                className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
              >
                {messages.filter((m) => m.role === "assistant").length}
              </Badge>
            )}
          </div>
        )}
        <span className="sr-only">
          {isOpen ? t("chat.close") : t("chat.open")}
        </span>
      </Button>
    </div>
  );
}
