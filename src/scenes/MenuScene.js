export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;

    // Hintergrund
    this.add.rectangle(width / 2, height / 2, width, height, 0x87ceeb);

    // Titel
    this.add.text(width / 2, 180, "Mein Spiel", {
      fontSize: "64px",
      color: "#000000",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Start-Knopf
    const button = this.add.rectangle(width / 2, 380, 320, 100, 0x4caf50);
    button.setInteractive();

    this.add.text(width / 2, 380, "START", {
      fontSize: "42px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(width / 2, 520, "Drücke Start", {
      fontSize: "30px",
      color: "#000000"
    }).setOrigin(0.5);

    button.on("pointerdown", () => {
      this.scene.start("GameScene");
    });
  }
}