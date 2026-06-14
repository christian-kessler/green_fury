import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {}

  create() {
    const g = this.add.graphics();

    // Spieler
    g.clear();
    g.fillStyle(0xff6b6b, 1);
    g.fillRoundedRect(0, 0, 60, 60, 12);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(20, 22, 5);
    g.fillCircle(40, 22, 5);
    g.generateTexture("player", 60, 60);

    // Bodenblock mit Gras
    g.clear();
    g.fillStyle(0x4caf50, 1);
    g.fillRect(0, 0, 220, 16);

    g.fillStyle(0x7a4f2a, 1);
    g.fillRect(0, 16, 220, 64);

    g.fillStyle(0x5d3b1f, 1);
    g.fillRect(0, 62, 220, 18);

    g.generateTexture("ground", 220, 80);

    // Button
    g.clear();
    g.fillStyle(0x4caf50, 1);
    g.fillRoundedRect(0, 0, 280, 90, 20);
    g.generateTexture("button", 280, 90);

    // Wolke
    g.clear();
    g.fillStyle(0xc7c7c7, 1);
    g.fillEllipse(45, 52, 55, 35);
    g.fillEllipse(80, 40, 65, 45);
    g.fillEllipse(120, 48, 55, 35);
    g.fillRoundedRect(35, 45, 95, 30, 15);
    g.generateTexture("cloud", 170, 100);

    // Sonne
    g.clear();
    g.fillStyle(0xffd54f, 1);
    g.fillCircle(50, 50, 28);

    g.lineStyle(5, 0xffc107, 1);
    g.beginPath();
    g.moveTo(50, 8);
    g.lineTo(50, 20);
    g.moveTo(50, 80);
    g.lineTo(50, 92);
    g.moveTo(8, 50);
    g.lineTo(20, 50);
    g.moveTo(80, 50);
    g.lineTo(92, 50);
    g.moveTo(20, 20);
    g.lineTo(28, 28);
    g.moveTo(72, 72);
    g.lineTo(80, 80);
    g.moveTo(20, 80);
    g.lineTo(28, 72);
    g.moveTo(72, 28);
    g.lineTo(80, 20);
    g.strokePath();

    g.generateTexture("sun", 100, 100);

    // Vogel
    g.clear();
    g.lineStyle(5, 0x333333, 1);
    g.beginPath();
    g.moveTo(8, 28);
    g.quadraticCurveTo(18, 14, 28, 28);
    g.moveTo(28, 28);
    g.quadraticCurveTo(38, 14, 48, 28);
    g.strokePath();
    g.generateTexture("bird", 56, 40);

    g.destroy();

    this.scene.start("MenuScene");
  }
}