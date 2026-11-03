import { defineRoom, defineServer } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";

import { ROOM_NAMES } from "@wot/shared";

import { MatchRoom } from "./rooms/match.room";

export const server = defineServer({
  transport: new WebSocketTransport(),
  rooms: {
    [ROOM_NAMES.MATCH]: defineRoom(MatchRoom),
  },
  express: (app) => {
    // Lets you (or a hosting platform) check the server is up without joining a room.
    app.get("/health", (_req, res) => {
      res.send("ok");
    });
  },
});
