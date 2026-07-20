import "../../../index.css";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react";
import { MeetingBookingForm } from "./MeetingBookingForm";
import { FORMATTED_MEETING_DATE } from "./meetings.fixture";

describe("MeetingBookingForm", () => {
  it("미팅 날짜 선택기에서 달력을 열 수 있다", async () => {
    await runSiheom(
      given.render(<MeetingBookingForm />),
      actions.click(query.button("미팅 날짜")),
      assertions.visible(query.region("미팅 날짜 달력")),
    );
  });

  it("미팅 날짜를 선택하면 트리거에 표시된다", async () => {
    await runSiheom(
      given.render(<MeetingBookingForm />),
      actions.click(query.button("미팅 날짜")),
      actions.click(
        query.within(query.region("미팅 날짜 달력"), query.button(FORMATTED_MEETING_DATE)),
      ),
      assertions.textContent(query.button("미팅 날짜"), FORMATTED_MEETING_DATE),
    );
  });

  it("미팅을 예약하면 확인 메시지가 보인다", async () => {
    await runSiheom(
      given.render(<MeetingBookingForm />),
      actions.click(query.button("미팅 날짜")),
      actions.click(
        query.within(query.region("미팅 날짜 달력"), query.button(FORMATTED_MEETING_DATE)),
      ),
      actions.click(query.button("예약하기")),
      assertions.textContent(query.status("예약 결과"), `${FORMATTED_MEETING_DATE} 미팅 예약됨`),
    );
  });
});
