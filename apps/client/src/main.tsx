import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GameCanvas } from "./GameCanvas";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GameCanvas />
  </StrictMode>,
);
