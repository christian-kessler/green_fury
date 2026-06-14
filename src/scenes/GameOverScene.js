import Phaser from "phaser";

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
    this.nameInput = null;
    this.enterHandler = null;
  }

  create(data) {
    const { width, height } = this.scale;

    const score = data && data.score ? data.score : 0;
    const highscore = data && data.highscore ? data.highscore : 0;
    const isNewHighscore = !!(data && data.isNewHighscore);

    const savedHighscoreName =
      window.localStorage.getItem("rockstar_highscore_name") || "ANON";

    this.add.rectangle(width / 2, height / 2, width, height, 0x87ceeb);

    this.add.text(width / 2, 90, "Game Over", {
      fontSize: "64px",
      color: "#000000",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(width / 2, 170, `Score: ${score}`, {
      fontSize: "42px",
      color: "#000000",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.highscoreText = this.add.text(
      width / 2,
      230,
      `Highscore: ${highscore} - ${savedHighscoreName}`,
      {
        fontSize: "36px",
        color: "#000000",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: width - 80 }
      }
    ).setOrigin(0.5);

    if (isNewHighscore) {
      this.add.text(width / 2, 300, "NEUER HIGHSCORE!", {
        fontSize: "34px",
        color: "#b30000",
        fontStyle: "bold"
      }).setOrigin(0.5);

      this.add.text(width / 2, 345, "Name eingeben:", {
        fontSize: "28px",
        color: "#000000",
        fontStyle: "bold"
      }).setOrigin(0.5);

      this.createNameInput(width / 2, 395);

      const saveButton = this.add.rectangle(width / 2, 465, 260, 80, 0x1976d2);
      saveButton.setInteractive();

      this.add.text(width / 2, 465, "SPEICHERN", {
        fontSize: "32px",
        color: "#ffffff",
        fontStyle: "bold"
      }).setOrigin(0.5);

      saveButton.on("pointerdown", () => {
        this.saveHighscore(highscore);
      });

      const restartButton = this.add.rectangle(width / 2, height - 90, 320, 90, 0x4caf50);
      restartButton.setInteractive();

      this.add.text(width / 2, height - 90, "NOCHMAL", {
        fontSize: "40px",
        color: "#ffffff",
        fontStyle: "bold"
      }).setOrigin(0.5);

      restartButton.on("pointerdown", () => {
        this.cleanupInput();
        this.scene.start("GameScene");
      });

      this.enterHandler = () => {
        this.saveHighscore(highscore);
      };

      this.input.keyboard.on("keydown-ENTER", this.enterHandler);
    } else {
      const button = this.add.rectangle(width / 2, 430, 320, 100, 0x4caf50);
      button.setInteractive();

      this.add.text(width / 2, 430, "NOCHMAL", {
        fontSize: "40px",
        color: "#ffffff",
        fontStyle: "bold"
      }).setOrigin(0.5);

      button.on("pointerdown", () => {
        this.scene.start("GameScene");
      });
    }
  }

  createNameInput(x, y) {
    const rect = this.game.canvas.getBoundingClientRect();

    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 12;
    input.placeholder = "DEIN NAME";
    input.autocomplete = "off";
    input.autocapitalize = "characters";
    input.style.position = "absolute";
    input.style.left = `${rect.left + x - 140}px`;
    input.style.top = `${rect.top + y - 24}px`;
    input.style.width = "280px";
    input.style.height = "48px";
    input.style.fontSize = "24px";
    input.style.fontWeight = "bold";
    input.style.textAlign = "center";
    input.style.border = "3px solid black";
    input.style.borderRadius = "8px";
    input.style.zIndex = "9999";

    document.body.appendChild(input);
    input.focus();

    this.nameInput = input;
  }

  saveHighscore(highscore) {
    let name = "ANON";

    if (this.nameInput) {
      const value = this.nameInput.value.trim();
      if (value) {
        name = value.toUpperCase();
      }
    }

    window.localStorage.setItem("rockstar_highscore", String(highscore));
    window.localStorage.setItem("rockstar_highscore_name", name);

    this.highscoreText.setText(`Highscore: ${highscore} - ${name}`);

    if (this.nameInput) {
      this.nameInput.blur();
    }
  }

  cleanupInput() {
    if (this.nameInput) {
      this.nameInput.remove();
      this.nameInput = null;
    }

    if (this.enterHandler) {
      this.input.keyboard.off("keydown-ENTER", this.enterHandler);
      this.enterHandler = null;
    }
  }

  shutdown() {
    this.cleanupInput();
  }

  destroy() {
    this.cleanupInput();
  }
}