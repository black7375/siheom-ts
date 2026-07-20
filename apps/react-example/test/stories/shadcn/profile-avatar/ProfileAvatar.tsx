"use client";

import { useId, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const UPLOAD_STEP_MS = 125;
const UPLOAD_STEPS = 4;
const UPLOADED_AVATAR_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z5+BQwAH/gJ+nf8+0wAAAABJRU5ErkJggg==";

export function ProfileAvatar() {
  const inputId = useId();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  function clearUploadInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    clearUploadInterval();
    setUploading(true);
    setProgress(0);
    setAvatarUrl(null);

    let step = 0;
    intervalRef.current = setInterval(() => {
      step += 1;
      if (step >= UPLOAD_STEPS) {
        clearUploadInterval();
        setProgress(100);
        setUploading(false);
        setAvatarUrl(UPLOADED_AVATAR_URL);
        return;
      }

      setProgress((step / UPLOAD_STEPS) * 100);
    }, UPLOAD_STEP_MS);
  }

  return (
    <section aria-label="아바타 업로드" className="mx-auto max-w-md space-y-4 p-4">
      <Avatar size="lg">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt="프로필 사진" />
        ) : (
          <AvatarFallback>?</AvatarFallback>
        )}
      </Avatar>

      <div>
        <Label htmlFor={inputId}>프로필 사진</Label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>

      {uploading ? <Progress value={progress} aria-label="업로드 진행" /> : null}
    </section>
  );
}
