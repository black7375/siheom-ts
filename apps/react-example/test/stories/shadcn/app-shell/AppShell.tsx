"use client";

import { Link, MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

function pageTitle(pathname: string) {
  return pathname === "/settings" ? "설정" : "대시보드";
}

function AppShellContent() {
  const { pathname } = useLocation();
  const title = pageTitle(pathname);

  return (
    <div role="region" aria-label="앱 셸">
      <Sidebar collapsible="none">
        <SidebarContent>
          <nav aria-label="앱 메뉴">
            <SidebarGroup>
              <SidebarGroupLabel>메뉴</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/"}
                      aria-current={pathname === "/" ? "page" : undefined}
                      render={<Link to="/">대시보드</Link>}
                    />
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === "/settings"}
                      aria-current={pathname === "/settings" ? "page" : undefined}
                      render={<Link to="/settings">설정</Link>}
                    />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </nav>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Routes>
          <Route
            path="/"
            element={
              <section aria-label="대시보드" className="p-4">
                <h2 className="text-lg font-semibold">대시보드</h2>
              </section>
            }
          />
          <Route
            path="/settings"
            element={
              <section aria-label="설정" className="p-4">
                <h2 className="text-lg font-semibold">설정</h2>
              </section>
            }
          />
        </Routes>
      </SidebarInset>
    </div>
  );
}

export function AppShell({ initialEntries = ["/"] }: { initialEntries?: string[] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <SidebarProvider>
        <AppShellContent />
      </SidebarProvider>
    </MemoryRouter>
  );
}
