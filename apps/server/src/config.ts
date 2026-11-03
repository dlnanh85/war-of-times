const DEFAULT_PORT = 2567;

function readPort(): number {
  const port = Number(process.env.PORT);
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT;
}

export const PORT = readPort();
