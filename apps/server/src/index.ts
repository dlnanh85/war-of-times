import { GAME_NAME } from "@wot/shared";

import { server } from "./app.config";
import { PORT } from "./config";
import { logger } from "./lib/logger";

await server.listen(PORT);
logger.info(`${GAME_NAME} server listening on ws://localhost:${PORT}`);
