import { GAME_NAME } from "@wot/shared";
import Phaser from "phaser";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  create() {
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, GAME_NAME, {
        fontSize: "48px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }
}
