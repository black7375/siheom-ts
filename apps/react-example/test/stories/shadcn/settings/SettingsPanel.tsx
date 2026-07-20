"use client";

import { Field, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsPanel() {
  return (
    <section aria-label="설정" className="mx-auto max-w-md p-4">
      <h2 id="settings-title" className="mb-4 text-lg font-semibold">
        설정
      </h2>
      <Tabs defaultValue="general">
        <TabsList aria-label="설정 탭">
          <TabsTrigger value="general">일반</TabsTrigger>
          <TabsTrigger value="notifications">알림</TabsTrigger>
        </TabsList>
        <TabsContent value="general" aria-labelledby="settings-title">
          <Field orientation="horizontal" className="mt-4">
            <FieldLabel htmlFor="dark-mode">다크 모드</FieldLabel>
            <Switch id="dark-mode" aria-label="다크 모드" />
          </Field>
        </TabsContent>
        <TabsContent value="notifications" aria-labelledby="settings-title">
          <FieldSet className="mt-4">
            <FieldLegend variant="label">알림 빈도</FieldLegend>
            <RadioGroup defaultValue="daily" aria-label="알림 빈도">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="immediate" id="notify-immediate" />
                <Label htmlFor="notify-immediate">즉시</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="daily" id="notify-daily" />
                <Label htmlFor="notify-daily">일일 요약</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="off" id="notify-off" />
                <Label htmlFor="notify-off">끄기</Label>
              </div>
            </RadioGroup>
          </FieldSet>
        </TabsContent>
      </Tabs>
    </section>
  );
}
