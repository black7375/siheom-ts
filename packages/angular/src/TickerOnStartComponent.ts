import { Component, signal } from "@angular/core";

@Component({
  selector: "app-ticker-on-start",
  standalone: true,
  template: `
    <div>
      <div role="status" aria-label="count">{{ count() }}</div>
      <button type="button" aria-label="start" (click)="start()">start</button>
    </div>
  `,
})
export class TickerOnStartComponent {
  count = signal(0);
  private intervalId?: ReturnType<typeof setInterval>;

  start() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.count.update((value) => value + 1);
    }, 1_000);
  }
}
