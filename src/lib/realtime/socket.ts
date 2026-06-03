"use client";

import { io, type Socket } from "socket.io-client";
import { getAuthToken, TOKEN_KEY } from "@/lib/api/client";

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ??
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace(
    /\/api\/v1\/?$/,
    "",
  );

export interface RealtimeUpdate {
  module: string;
  action: string;
  entityType: string;
  entityId?: string;
  at: string;
}

let socket: Socket | null = null;

export function getRealtimeSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  const token = getAuthToken();
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }
  if (socket?.connected) return socket;

  socket = io(`${WS_BASE}/realtime`, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  });

  socket.on("connect_error", () => {
    socket?.disconnect();
    socket = null;
  });

  return socket;
}

export function disconnectRealtime(): void {
  socket?.disconnect();
  socket = null;
}

export function subscribeRealtime(
  handler: (payload: RealtimeUpdate) => void,
): () => void {
  const s = getRealtimeSocket();
  if (!s) return () => undefined;

  const onUpdate = (payload: RealtimeUpdate) => handler(payload);
  s.on("lifeos:update", onUpdate);

  const onStorage = (e: StorageEvent) => {
    if (e.key === TOKEN_KEY) {
      if (!e.newValue) disconnectRealtime();
      else {
        disconnectRealtime();
        getRealtimeSocket();
      }
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    s.off("lifeos:update", onUpdate);
    window.removeEventListener("storage", onStorage);
  };
}
