"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TEAM_MEMBERS,
  TEAM_ROLES,
  type TeamInvite,
  type TeamMember,
  type TeamRole,
} from "./members.fixture";

export function TeamInviteForm({ onInvite }: { onInvite: (invite: TeamInvite) => Promise<void> }) {
  const [role, setRole] = useState<TeamRole | "">("");
  const [member, setMember] = useState<TeamMember | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const roleLabel = TEAM_ROLES.find((item) => item.value === role)?.label;

  return (
    <section aria-label="팀원 초대" className="mx-auto max-w-md p-4">
      <h2 id="team-invite-title" className="mb-4 text-lg font-semibold">
        팀원 초대
      </h2>
      <form
        aria-labelledby="team-invite-title"
        className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!member || !role) return;

          await onInvite({ member, role });
          setStatus(`${member}를 ${roleLabel}로 초대했습니다`);
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="team-role">역할</FieldLabel>
            <Select value={role} onValueChange={(value) => setRole(value as TeamRole)} required>
              <SelectTrigger id="team-role" className="w-full">
                <SelectValue placeholder="역할 선택" />
              </SelectTrigger>
              <SelectContent aria-label="역할">
                {TEAM_ROLES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="team-member">팀원</FieldLabel>
            <Combobox
              items={[...TEAM_MEMBERS]}
              value={member}
              onValueChange={(value) => setMember(value as TeamMember | null)}
            >
              <ComboboxInput id="team-member" placeholder="팀원 검색..." aria-label="팀원" />
              <ComboboxContent aria-label="팀원 목록">
                <ComboboxEmpty>일치하는 팀원이 없습니다</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>
        </FieldGroup>

        <Button type="submit">초대하기</Button>
      </form>

      {status ? (
        <p role="status" aria-label="초대 결과" className="mt-4 text-sm">
          {status}
        </p>
      ) : null}
    </section>
  );
}
