// One 1v1 match. Colyseus creates a MatchRoom per game and puts two players in it;
// for now it only tracks who is connected.
import { Room, type Client } from "@colyseus/core";

import { logger } from "../lib/logger";
import { MatchState, PlayerState } from "./schema/match.schema";

const MAX_PLAYERS = 2;

export class MatchRoom extends Room<{ state: MatchState }> {
  maxClients = MAX_PLAYERS;
  state = new MatchState();

  onCreate() {
    logger.info("match created", this.roomId);
  }

  onJoin(client: Client) {
    this.state.players.set(client.sessionId, new PlayerState({ sessionId: client.sessionId }));
    logger.info("player joined", this.roomId, client.sessionId);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
    logger.info("player left", this.roomId, client.sessionId);
  }

  onDispose() {
    logger.info("match disposed", this.roomId);
  }
}
