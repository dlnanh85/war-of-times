// Synced state for one match. Colyseus sends changes to this object to both
// players automatically after every patch, so keep it to what the client draws.
import { schema, t, type SchemaType } from "@colyseus/schema";

export const PlayerState = schema(
  {
    sessionId: t.string(),
  },
  "PlayerState",
);
export type PlayerState = SchemaType<typeof PlayerState>;

export const MatchState = schema(
  {
    players: t.map(PlayerState),
  },
  "MatchState",
);
export type MatchState = SchemaType<typeof MatchState>;
