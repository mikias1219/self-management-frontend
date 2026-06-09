import { apiClient } from "./client";

export interface GoogleCalendarStatus {
  configured: boolean;
  connected: boolean;
  /** True when API probe can read/write calendar events. */
  syncReady?: boolean;
  scopeError?: 'insufficient_scopes' | null;
  setupError?: 'api_disabled' | null;
  setupHelpUrl?: string | null;
  needsReconnect?: boolean;
  email: string | null;
  calendarId: string;
}

export interface CalendarFeedConfig {
  icalFeedUrl?: string;
  embedSrc?: string;
  timezone?: string;
  usingDefaults?: boolean;
}

export interface CalendarEventPreview {
  uid: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  recurring: boolean;
}

export interface CalendarEventsResponse {
  configured: boolean;
  timezone: string;
  embedSrc: string | null;
  events: CalendarEventPreview[];
}

export interface CalendarExportInfo {
  token: string;
  feedUrl: string;
  googleSubscribeUrl: string;
  note: string;
}

export const integrationsApi = {
  googleCalendar: {
    getStatus: () =>
      apiClient
        .get<GoogleCalendarStatus>("/integrations/google-calendar/status")
        .then((r) => r.data),

    getAuthUrl: () =>
      apiClient
        .get<
          | { configured: true; url: string }
          | { configured: false; url: null; message: string }
        >("/integrations/google-calendar/auth-url")
        .then((r) => r.data),

    connect: (code: string, state: string) =>
      apiClient
        .post<{ email?: string }>("/integrations/google-calendar/connect", {
          code,
          state,
        })
        .then((r) => r.data),

    disconnect: () =>
      apiClient.delete("/integrations/google-calendar/disconnect"),

    reconnect: () =>
      apiClient
        .post<
          | { configured: true; url: string }
          | { configured: false; url: null; message: string }
        >("/integrations/google-calendar/reconnect")
        .then((r) => r.data),

    getFeed: () =>
      apiClient
        .get<CalendarFeedConfig>("/integrations/google-calendar/feed")
        .then((r) => r.data),

    updateFeed: (data: CalendarFeedConfig) =>
      apiClient
        .patch<CalendarFeedConfig>("/integrations/google-calendar/feed", data)
        .then((r) => r.data),

    getEvents: (days = 14) =>
      apiClient
        .get<CalendarEventsResponse>("/integrations/google-calendar/events", {
          params: { days },
        })
        .then((r) => r.data),

    deleteEvent: (eventId: string) =>
      apiClient.delete(`/integrations/google-calendar/events/${eventId}`),

    getEmbedUrl: () =>
      apiClient
        .get<{ url: string | null }>("/integrations/google-calendar/embed-url")
        .then((r) => r.data),

    getExportInfo: () =>
      apiClient
        .get<CalendarExportInfo>("/integrations/google-calendar/export-info")
        .then((r) => r.data),

    downloadExportIcs: async () => {
      const res = await apiClient.get<string>(
        "/integrations/google-calendar/export.ics",
        { responseType: "text" },
      );
      return res.data;
    },
  },
};
