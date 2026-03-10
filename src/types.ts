export interface Calendar {
  id: string;
  name: string;
  color: string;
}

export interface CalendarEvent {
  id: string;
  calendarId: string;
  calendarName: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
  allDay: boolean;
}

export interface ListOptions {
  days?: number;
  from?: string;
  to?: string;
  calendar?: string;
}
