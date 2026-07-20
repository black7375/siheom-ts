"use client";

import { useState } from "react";
import { BotIcon, SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type ChatMessage, fakeLlmApi, type LlmApi } from "./fake-llm-api";

function appendAssistantReply(messages: ChatMessage[], content: string): ChatMessage[] {
  const last = messages.at(-1);
  if (last?.role === "assistant") {
    return [...messages.slice(0, -1), { ...last, content }];
  }
  return [...messages, { role: "assistant", content }];
}

function AssistantMessage({ content, streaming }: { content: string; streaming: boolean }) {
  if (streaming && content === "") {
    return (
      <p role="status" aria-label="어시스턴트 응답 대기 중" className="text-muted-foreground">
        응답 생성 중…
      </p>
    );
  }

  if (streaming) {
    return (
      <p role="status" aria-label="어시스턴트 응답 스트리밍">
        {content}
      </p>
    );
  }

  return (
    <p role="status" aria-label="어시스턴트 응답">
      {content}
    </p>
  );
}

export function StreamingChat({ api = fakeLlmApi }: { api?: LlmApi }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);

  async function handleSend() {
    const trimmed = draft.trim();
    if (!trimmed || streaming) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
      { role: "assistant", content: "" },
    ];

    setMessages(nextMessages);
    setDraft("");
    setStreaming(true);

    try {
      await api.sendMessageStream(
        nextMessages.filter((message) => message.content !== ""),
        (chunk) => {
          setMessages((current) => {
            const last = current.at(-1);
            const accumulated = last?.role === "assistant" ? `${last.content}${chunk}` : chunk;
            return appendAssistantReply(current, accumulated);
          });
        },
      );
    } finally {
      setStreaming(false);
    }
  }

  return (
    <section aria-label="LLM 채팅" className="mx-auto max-w-lg p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BotIcon className="size-4" aria-hidden="true" />
            LLM 채팅
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ul aria-label="대화" className="flex min-h-48 flex-col gap-3">
            {messages.map((message, index) => {
              if (message.role === "user") {
                return (
                  <li
                    key={`${message.role}-${index}`}
                    aria-label={message.content}
                    className="self-end rounded-lg bg-primary px-3 py-2 text-primary-foreground"
                  >
                    {message.content}
                  </li>
                );
              }

              const isStreamingAssistant = streaming && index === messages.length - 1;

              return (
                <li
                  key={`${message.role}-${index}`}
                  className="self-start rounded-lg border bg-muted/40 px-3 py-2"
                >
                  <AssistantMessage content={message.content} streaming={isStreamingAssistant} />
                </li>
              );
            })}
          </ul>
        </CardContent>

        <CardFooter className="flex flex-col items-stretch gap-2 border-t">
          <div className="grid gap-2">
            <Label htmlFor="chat-message">메시지</Label>
            <Textarea
              id="chat-message"
              aria-label="메시지"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="메시지를 입력하세요"
              rows={3}
            />
          </div>
          <Button
            type="button"
            onClick={() => void handleSend()}
            disabled={streaming || !draft.trim()}
          >
            <SendIcon className="size-4" aria-hidden="true" />
            전송
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
