"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Document = {
  id: string;
  title: string;
  description: string;
};

function DocumentCard({
  document,
  onCopy,
  onDelete,
}: {
  document: Document;
  onCopy: (title: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <article aria-label={document.title}>
          <Card>
            <CardHeader>
              <CardTitle>{document.title}</CardTitle>
              <CardDescription>{document.description}</CardDescription>
            </CardHeader>
            <CardFooter className="justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" />}>
                  {document.title} 더보기
                </DropdownMenuTrigger>
                <DropdownMenuContent aria-label="문서 동작">
                  <DropdownMenuItem onClick={() => onCopy(document.title)}>복사</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {}}>이름 변경</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(document.id)}>
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        </article>
      </ContextMenuTrigger>
      <ContextMenuContent aria-label="문서 동작">
        <ContextMenuItem onClick={() => onCopy(document.title)}>복사</ContextMenuItem>
        <ContextMenuItem onClick={() => {}}>이름 변경</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onClick={() => onDelete(document.id)}>
          삭제
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function DocumentActions({
  initialDocuments = [
    {
      id: "plan",
      title: "기획서",
      description: "2026년 1분기 제품 기획 문서",
    },
  ],
}: {
  initialDocuments?: Document[];
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [status, setStatus] = useState<string | null>(null);

  return (
    <section aria-label="문서 목록" className="mx-auto max-w-md space-y-4 p-4">
      {status ? (
        <p role="status" aria-label="복사 결과">
          {status}
        </p>
      ) : null}
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onCopy={(title) => setStatus(`${title} 복사됨`)}
          onDelete={(id) => {
            setDocuments((current) => current.filter((item) => item.id !== id));
            setStatus(null);
          }}
        />
      ))}
    </section>
  );
}
