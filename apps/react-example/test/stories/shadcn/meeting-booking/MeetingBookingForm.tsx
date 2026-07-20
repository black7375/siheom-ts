"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BOOKING_DEFAULT_MONTH, formatMeetingDate, meetingDateLabel } from "./meetings.fixture";

export function MeetingBookingForm() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<string | null>(null);

  return (
    <section aria-label="미팅 예약" className="mx-auto max-w-md p-4">
      <h2 id="meeting-booking-title" className="mb-4 text-lg font-semibold">
        미팅 예약
      </h2>

      <form
        aria-labelledby="meeting-booking-title"
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!date) return;

          setStatus(`${formatMeetingDate(date)} 미팅 예약됨`);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                aria-label="미팅 날짜"
                className="w-full justify-start"
              >
                {meetingDateLabel(date)}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <section aria-label="미팅 날짜 달력" className="p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selected) => {
                  setDate(selected);
                  setOpen(false);
                }}
                defaultMonth={BOOKING_DEFAULT_MONTH}
                components={{
                  DayButton: (props) => (
                    <CalendarDayButton
                      {...props}
                      aria-label={formatMeetingDate(props.day.date)}
                    />
                  ),
                }}
              />
            </section>
          </PopoverContent>
        </Popover>

        <Button type="submit">예약하기</Button>
      </form>

      {status ? (
        <p role="status" aria-label="예약 결과" className="mt-4 text-sm">
          {status}
        </p>
      ) : null}
    </section>
  );
}
