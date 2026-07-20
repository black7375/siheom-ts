import { act } from "react";

import { ASSISTANT_REPLY } from "./chat.fixture";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type LlmApi = {
  sendMessageStream: (
    messages: ChatMessage[],
    onChunk: (content: string) => void,
  ) => Promise<string>;
};

export class FakeLlmApi implements LlmApi {
  private streamChunks: string[] | null = null;
  private streamChunkGates: Array<() => void> = [];
  private defaultReply = ASSISTANT_REPLY;

  reset(): void {
    this.streamChunks = null;
    this.streamChunkGates = [];
    this.defaultReply = ASSISTANT_REPLY;
  }

  setStreamChunks(chunks: readonly string[]): void {
    this.streamChunks = [...chunks];
  }

  setDefaultReply(reply: string): void {
    this.defaultReply = reply;
  }

  releaseNextStreamChunk(): void {
    const resolve = this.streamChunkGates.shift();
    resolve?.();
  }

  async releaseNextStreamChunkInAct(): Promise<void> {
    await act(async () => {
      this.releaseNextStreamChunk();
      await Promise.resolve();
    });
  }

  getPendingStreamChunkCount(): number {
    return this.streamChunkGates.length;
  }

  async waitForStreamWaiting(timeoutMs = 1_000): Promise<void> {
    const start = Date.now();
    while (this.streamChunkGates.length === 0) {
      if (Date.now() - start > timeoutMs) {
        throw new Error("stream did not start waiting");
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  private waitForStreamChunkRelease(): Promise<void> {
    if (!this.streamChunks) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.streamChunkGates.push(resolve);
    });
  }

  async sendMessageStream(
    _messages: ChatMessage[],
    onChunk: (content: string) => void,
  ): Promise<string> {
    const chunks = this.streamChunks ?? [this.defaultReply];
    let content = "";

    for (const chunk of chunks) {
      await this.waitForStreamChunkRelease();
      content += chunk;
      onChunk(chunk);
    }

    return content;
  }
}

export const fakeLlmApi = new FakeLlmApi();
