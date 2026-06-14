import Phaser from "phaser";

export default class Background {
  constructor(scene, width, height) {
    this.scene = scene;
    this.width = width;
    this.height = height;

    this.graphics = scene.add.graphics();
    this.cloudGraphics = scene.add.graphics();

    this.pixelSize = 8;

    // Wolken-Daten
    this.clouds = [
      { x: 120, y: 80, speed: 18, scale: 1.0 },
      { x: 360, y: 50, speed: 26, scale: 1.2 },
      { x: 700, y: 100, speed: 20, scale: 1.1 },
      { x: 980, y: 65, speed: 14, scale: 1.3 }
    ];

    this.drawSky();
    this.drawClouds();
  }

  pixelRect(g, x, y, w, h, color) {
    g.fillStyle(color, 1);
    g.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  getNoise(x) {
    const n = Math.sin(x * 12.9898) * 43758.5453;
    return n - Math.floor(n);
  }

  drawSky() {
    const g = this.graphics;
    g.clear();

    const p = this.pixelSize;

    for (let y = 0; y < this.height; y += p) {
      const variation = Math.floor(this.getNoise(y / p) * 16);

      const color = Phaser.Display.Color.GetColor(
        110 + variation,
        174 + variation,
        230 + variation
      );

      this.pixelRect(g, 0, y, this.width, p, color);
    }

    // helle Streifen wie im Bild
    this.pixelRect(g, 0, 120, this.width, 32, 0x7bbcf0);
    this.pixelRect(g, 0, 220, this.width, 24, 0x86c5f5);
  }

  drawCloud(x, y, scale = 1) {
    const g = this.cloudGraphics;
    const p = this.pixelSize * scale;

    const whiteBlocks = [
      [2, 0], [3, 0], [4, 0],
      [1, 1], [2, 1], [3, 1], [4, 1], [5, 1],
      [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
      [1, 3], [2, 3], [3, 3], [4, 3], [5, 3],
      [2, 4], [3, 4], [4, 4]
    ];

    const shadowBlocks = [
      [1, 4], [5, 4],
      [2, 5], [3, 5], [4, 5]
    ];

    for (const block of whiteBlocks) {
      this.pixelRect(g, x + block[0] * p, y + block[1] * p, p, p, 0xfafafa);
    }

    for (const block of shadowBlocks) {
      this.pixelRect(g, x + block[0] * p, y + block[1] * p, p, p, 0xd7e7f2);
    }
  }

  drawClouds() {
    this.cloudGraphics.clear();

    for (const cloud of this.clouds) {
      this.drawCloud(cloud.x, cloud.y, cloud.scale);
    }
  }

  update(delta) {
    const dt = delta / 1000;

    // Wolken wirklich bewegen
    for (const cloud of this.clouds) {
      cloud.x -= cloud.speed * dt;

      // Wenn Wolke links raus ist, rechts neu erscheinen
      const cloudWidth = 7 * this.pixelSize * cloud.scale;
      if (cloud.x < -cloudWidth - 20) {
        cloud.x = this.width + Phaser.Math.Between(40, 180);
        cloud.y = Phaser.Math.Between(40, 120);
        cloud.scale = Phaser.Math.FloatBetween(0.9, 1.4);
        cloud.speed = Phaser.Math.Between(14, 28);
      }
    }

    this.drawClouds();
  }
}