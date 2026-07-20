export const BOOKING_DEFAULT_MONTH = new Date(2024, 2, 1);

export const SELECTED_MEETING_DAY = 15;

export const SELECTED_MEETING_DATE = new Date(2024, 2, SELECTED_MEETING_DAY);

export const FORMATTED_MEETING_DATE = "2024년 3월 15일";

export function formatMeetingDate(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function meetingDateLabel(date: Date | undefined, placeholder = "날짜 선택"): string {
  return date ? formatMeetingDate(date) : placeholder;
}
