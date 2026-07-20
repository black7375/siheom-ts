"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REVENUE_SERIES, REVENUE_TOTAL, VISITOR_SERIES, VISITOR_TOTAL } from "./metrics.fixture";

const revenueChartConfig = {
  value: {
    label: "매출",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const visitorChartConfig = {
  value: {
    label: "방문자",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartDashboard() {
  return (
    <section aria-label="지표 대시보드" className="mx-auto max-w-2xl p-4">
      <h2 id="chart-dashboard-title" className="mb-4 text-lg font-semibold">
        지표 대시보드
      </h2>

      <Tabs defaultValue="revenue">
        <TabsList aria-label="지표 탭">
          <TabsTrigger value="revenue">매출</TabsTrigger>
          <TabsTrigger value="visitors">방문자</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" aria-labelledby="chart-dashboard-title">
          <section aria-label="매출 차트" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>주간 매출</CardTitle>
                <CardDescription>최근 5일 매출 추이</CardDescription>
              </CardHeader>
              <CardContent>
                <p role="status" aria-label="총 매출" className="mb-4 text-2xl font-semibold">
                  {REVENUE_TOTAL}
                </p>
                <ChartContainer config={revenueChartConfig} className="min-h-48 w-full">
                  <BarChart accessibilityLayer data={[...REVENUE_SERIES]}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="visitors" aria-labelledby="chart-dashboard-title">
          <section aria-label="방문자 차트" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>주간 방문자</CardTitle>
                <CardDescription>최근 5일 방문자 추이</CardDescription>
              </CardHeader>
              <CardContent>
                <p role="status" aria-label="총 방문자" className="mb-4 text-2xl font-semibold">
                  {VISITOR_TOTAL}
                </p>
                <ChartContainer config={visitorChartConfig} className="min-h-48 w-full">
                  <BarChart accessibilityLayer data={[...VISITOR_SERIES]}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
      </Tabs>
    </section>
  );
}
