/** Registered Colyseus room names, shared so the client joins the same name the server defines. */
export const ROOM_NAMES = {
  MATCH: "match",
} as const;

export type RoomName = (typeof ROOM_NAMES)[keyof typeof ROOM_NAMES];
