"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTaskBadgeVariant, getTotalPages, paginateTasks, TASKS } from "./tasks.fixture";

export function TaskTable() {
  const [page, setPage] = useState(1);
  const pageTasks = paginateTasks(TASKS, page);
  const totalPages = getTotalPages(TASKS.length);

  return (
    <section aria-label="할 일 관리" className="mx-auto max-w-2xl p-4">
      <h2 id="task-table-title" className="mb-4 text-lg font-semibold">
        할 일 관리
      </h2>

      <Table aria-label="할 일">
        <TableHeader>
          <TableRow>
            <TableHead>제목</TableHead>
            <TableHead>상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageTasks.map((task) => (
            <TableRow key={task.id} aria-label={task.title}>
              <TableCell>{task.title}</TableCell>
              <TableCell>
                <Badge
                  variant={getTaskBadgeVariant(task.status)}
                  role="status"
                  aria-label={`${task.title} 상태`}
                >
                  {task.statusLabel}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-label="이전 페이지"
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setPage((current) => Math.max(1, current - 1));
              }}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              aria-label="다음 페이지"
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setPage((current) => Math.min(totalPages, current + 1));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </section>
  );
}
