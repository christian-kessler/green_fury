import Phaser from "phaser";

export default class Ground {
    constructor(scene, width, groundY, groundHeight) {
        this.scene = scene;
        this.width = width;
        this.groundY = groundY;
        this.groundHeight = groundHeight;

        this.graphics = scene.add.graphics();

        this.holeSpeed = 320;
        this.worldOffset = 0;
        this.pixelSize = 8;

        this.minHoleGap = Math.floor(width * 0.25);

        this.holes = [
            { x: width + 80, width: 140 },
            { x: width + 80 + 140 + this.minHoleGap, width: 210 }
        ];

        this.grassColors = [0x6fcf4f, 0x5fc143, 0x7bdd58, 0x4caf50];
        this.dirtColors = [0x7d4525, 0x8f4f2b, 0x9b5a32, 0xa86438, 0xb76f43];
    }

    update(delta) {
        const dt = delta / 1000;

        this.worldOffset += this.holeSpeed * dt;

        for (const hole of this.holes) {
            hole.x -= this.holeSpeed * dt;
        }

        for (const hole of this.holes) {
            if (hole.x + hole.width < 0) {
                let farthestRight = this.width;

                for (const otherHole of this.holes) {
                    if (otherHole === hole) {
                        continue;
                    }

                    const otherRight = otherHole.x + otherHole.width;
                    if (otherRight > farthestRight) {
                        farthestRight = otherRight;
                    }
                }

                hole.width = Phaser.Math.Between(110, 230);
                hole.x = farthestRight + this.minHoleGap;
            }
        }
    }

    getNoise(x, y) {
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return n - Math.floor(n);
    }

isPointInsideHole(x) {
  const pad = 4;

  for (const hole of this.holes) {
    if (x > hole.x + pad && x < hole.x + hole.width - pad) {
      return true;
    }
  }
  return false;
}

    hasGroundAtX(x) {
        return !this.isPointInsideHole(x);
    }

    draw() {
        const g = this.graphics;
        g.clear();

        const p = this.pixelSize;

        g.fillStyle(0x9b5a32, 1);
        g.fillRect(0, this.groundY + 16, this.width, this.groundHeight);

        for (let y = this.groundY + 24; y < this.groundY + this.groundHeight; y += p) {
            for (let screenX = 0; screenX < this.width; screenX += p) {
                const worldX = Math.floor(screenX + this.worldOffset);
                const cellX = Math.floor(worldX / p);
                const cellY = Math.floor(y / p);

                const noise = this.getNoise(cellX, cellY);

                let color = this.dirtColors[2];

                if (noise < 0.2) color = this.dirtColors[0];
                else if (noise < 0.4) color = this.dirtColors[1];
                else if (noise < 0.6) color = this.dirtColors[2];
                else if (noise < 0.8) color = this.dirtColors[3];
                else color = this.dirtColors[4];

                g.fillStyle(color, 1);
                g.fillRect(screenX, y, p, p);
            }
        }

        g.fillStyle(0x4caf50, 1);
        g.fillRect(0, this.groundY, this.width, 16);

        for (let screenX = 0; screenX < this.width; screenX += p) {
            const worldX = Math.floor(screenX + this.worldOffset);
            const cellX = Math.floor(worldX / p);

            const noiseA = this.getNoise(cellX, 1);
            const noiseB = this.getNoise(cellX, 2);

            let color = this.grassColors[0];
            if (noiseA < 0.25) color = this.grassColors[0];
            else if (noiseA < 0.5) color = this.grassColors[1];
            else if (noiseA < 0.75) color = this.grassColors[2];
            else color = this.grassColors[3];

            const h = 6 + Math.floor(noiseB * 8);

            g.fillStyle(color, 1);
            g.fillRect(screenX, this.groundY + 16 - h, p, h);
        }

        g.fillStyle(0x6b3a1e, 1);
        g.fillRect(0, this.groundY + this.groundHeight - 12, this.width, 12);

        for (const hole of this.holes) {
            g.fillStyle(0x6eaee6, 1);
            g.fillRect(hole.x, this.groundY, hole.width, this.groundHeight + 20);

            g.fillStyle(0x5d3b1f, 1);
            g.fillRect(hole.x, this.groundY + 16, 8, this.groundHeight, 1);
            g.fillRect(hole.x + hole.width - 8, this.groundY + 16, 8, this.groundHeight, 1);
        }
    }
}