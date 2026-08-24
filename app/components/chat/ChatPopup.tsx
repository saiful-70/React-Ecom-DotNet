"use client";

import { useAtom } from "jotai";
import { useEffect, useRef, useState, useTransition } from "react";
import { X, Send, Trash2, Sparkles } from "lucide-react";
import { chatOpenAtom, chatMessagesAtom, chatLoadingAtom } from "@/store/chat.atom";
import { ChatMessage as ChatMessageType } from "@/lib/chat/model";
import { askQuestion } from "@/lib/chat/action";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { ScrollArea } from "@/components/shared/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

/**
 * Chat popup component
 * Handles chat UI, message display, and user interactions
 */
export function ChatPopup() {
  const [isOpen, setIsOpen] = useAtom(chatOpenAtom);
  const [messages, setMessages] = useAtom(chatMessagesAtom);
  const [isLoading, setIsLoading] = useAtom(chatLoadingAtom);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [messages, isLoading]);

  // Focus input when popup opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call server action
      startTransition(async () => {
        const response = await askQuestion(userMessage.content);

        const assistantMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.Answer,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(t("chat.error"));
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success(t("chat.cleared"));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed right-2 md:right-6 left-2 md:left-auto z-50 md:w-full md:max-w-md animate-in slide-in-from-bottom-4 fade-in"
      style={{ bottom: "calc(7rem + var(--mobile-nav-offset, 0px))" }}
    >
      <div className="bg-background border rounded-lg shadow-2xl overflow-hidden flex flex-col h-[500px] md:h-[600px]">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs md:text-sm">{t("chat.title")}</h3>
              <p className="text-[10px] md:text-xs opacity-90">{t("chat.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                className="h-8 w-8 hover:bg-primary-foreground/20"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">{t("chat.clear")}</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t("chat.close")}</span>
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-3 md:p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-6">
              <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <h4 className="font-semibold text-base md:text-lg mb-2">
                {t("chat.welcome")}
              </h4>
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                {t("chat.welcomeMessage")}
              </p>
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => setInput(t("chat.suggestion1"))}
                  className="text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-left"
                >
                  {t("chat.suggestion1")}
                </button>
                <button
                  onClick={() => setInput(t("chat.suggestion2"))}
                  className="text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-left"
                >
                  {t("chat.suggestion2")}
                </button>
                <button
                  onClick={() => setInput(t("chat.suggestion3"))}
                  className="text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg border hover:bg-accent transition-colors text-left"
                >
                  {t("chat.suggestion3")}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex gap-3 mb-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-lg rounded-tl-none px-4 py-2.5">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-3 md:p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("chat.placeholder")}
              disabled={isLoading || isPending}
              className="flex-1 text-sm md:text-base"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isPending}
              size="icon"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">{t("chat.send")}</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {t("chat.poweredBy")}
          </p>
        </div>
      </div>
    </div>
  );
}
