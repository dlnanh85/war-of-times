import Phaser from "phaser";
import { useEffect, useRef } from "react";
import { TitleScene } from "./TitleScene";

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current!,
      width: 800,
      height: 450,
      backgroundColor: "#1d2b3a",
      scene: [TitleScene],
    });
    return () => game.destroy(true);
  }, []);

  return <div ref={containerRef} />;
}
