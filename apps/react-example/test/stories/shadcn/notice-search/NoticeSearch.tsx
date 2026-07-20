"use client";

import { useState } from "react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { filterNotices, NOTICES } from "./notices.fixture";

export function NoticeSearch() {
  const [query, setQuery] = useState("");
  const results = filterNotices(NOTICES, query);
  const showEmpty = query.trim().length > 0 && results.length === 0;

  return (
    <section aria-label="공지 검색" className="mx-auto max-w-md p-4">
      <h2 id="notice-search-title" className="mb-4 text-lg font-semibold">
        공지 검색
      </h2>

      <Field className="mb-4">
        <FieldLabel htmlFor="notice-search-input">공지 검색</FieldLabel>
        <Input
          id="notice-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="제목이나 내용으로 검색"
        />
      </Field>

      {showEmpty ? (
        <section aria-label="검색 결과 없음">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
              <EmptyDescription>다른 검색어로 다시 시도해 보세요.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </section>
      ) : (
        <ul className="flex flex-col gap-2">
          {results.map((notice) => (
            <li
              key={notice.id}
              aria-label={notice.title}
              className="rounded-lg border bg-card p-3 shadow-sm"
            >
              <p className="font-medium">{notice.title}</p>
              <p className="text-sm text-muted-foreground">{notice.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
