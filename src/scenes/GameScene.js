import Phaser from "phaser";
import Player from "../objects/Player";
import Ground from "../objects/Ground";
import Background from "../objects/Background";
import Dogs from "../objects/Dogs";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {
        const { width, height } = this.scale;

        this.groundY = height - 170;
        this.groundHeight = 170;

        this.background = new Background(this, width, height);
        this.ground = new Ground(this, width, this.groundY, this.groundHeight);
        this.player = new Player(this, 220, this.groundY);
        this.dogs = new Dogs(this, this.ground, this.groundY);

        this.hasStarted = false;
        this.isRecovering = false;
        this.isGameOver = false;

        this.lives = 3;
        this.score = 0;
        this.distanceCounter = 0;

        this.cheatTapCount = 0;
        this.cheatEnabled = false;

        this.heartCheatTapCount = 0;
        this.heartCheatEnabled = false;

        this.recoverTimer = null;

        const savedHighscore = window.localStorage.getItem("rockstar_highscore");
        this.highscore = savedHighscore ? parseInt(savedHighscore, 10) : 0;

        this.scoreText = this.add.text(30, 20, "Score: 0", {
            fontSize: "32px",
            color: "#000000",
            fontStyle: "bold"
        });

        this.heartsText = this.add.text(width - 30, 20, "", {
            fontSize: "34px",
            color: "#d11a2a",
            fontStyle: "bold"
        }).setOrigin(1, 0);

        this.attackButton = this.add.circle(width - 95, height - 95, 55, 0xb71c1c, 0.7)
            .setScrollFactor(0)
            .setDepth(1000);

        this.attackButtonRing = this.add.circle(width - 95, height - 95, 61)
            .setStrokeStyle(6, 0xffffff, 0.9)
            .setScrollFactor(0)
            .setDepth(1001);

        this.attackButtonText = this.add.text(width - 95, height - 95, "HIT", {
            fontSize: "28px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5).setDepth(1002);

        this.cheatStatusText = this.add.text(30, 60, "", {
            fontSize: "22px",
            color: "#008800",
            fontStyle: "bold"
        });

        this.updateHearts();
        this.ground.draw();

        this.input.on("pointerdown", (pointer) => {
            if (this.isGameOver) {
                return;
            }

            const tappedTopLeft = pointer.x <= 120 && pointer.y <= 120;
            const tappedTopRight = pointer.x >= width - 120 && pointer.y <= 120;

            if (tappedTopLeft) {
                this.handleCheatTap();
                return;
            }

            if (tappedTopRight) {
                this.handleHeartCheatTap();
                return;
            }

            if (this.isRecovering) {
                return;
            }

            const dx = pointer.x - this.attackButton.x;
            const dy = pointer.y - this.attackButton.y;
            const pressedAttack = (dx * dx + dy * dy) <= (55 * 55);

            if (!this.hasStarted) {
                this.hasStarted = true;
            }

            if (pressedAttack) {
                this.player.attack();
                return;
            }

            this.player.jump(this.groundY);
        });
    }

    isInvincible() {
        return this.cheatEnabled;
    }

    handleCheatTap() {
        // Wenn Cheat aktiv ist → EINMAL tippen = AUS
        if (this.cheatEnabled) {
            this.cheatEnabled = false;
            this.cheatTapCount = 0;

            this.cheatStatusText.setText("UNSTERBLICHKEIT AUS");
            return;
        }

        // Wenn Cheat AUS ist → zählen bis 10
        this.cheatTapCount += 1;
        this.cheatStatusText.setText(`Cheat ${this.cheatTapCount}/10`);

        if (this.cheatTapCount >= 10) {
            this.cheatEnabled = true;
            this.cheatTapCount = 0;

            this.isRecovering = false;

            if (this.recoverTimer) {
                this.recoverTimer.remove(false);
                this.recoverTimer = null;
            }

            this.cheatStatusText.setText("UNSTERBLICHKEIT AN");
        }
    }

    handleHeartCheatTap() {
        this.heartCheatTapCount += 1;
        this.cheatStatusText.setText(`Herz-Cheat ${this.heartCheatTapCount}/5`);

        if (this.heartCheatTapCount >= 5) {
            this.heartCheatEnabled = !this.heartCheatEnabled;
            this.heartCheatTapCount = 0;

            if (this.heartCheatEnabled) {
                this.lives = 5;
                this.cheatStatusText.setText("5 HERZEN AN");
            } else {
                this.lives = Math.min(this.lives, 3);
                this.cheatStatusText.setText("5 HERZEN AUS");
            }

            this.updateHearts();
        }
    }

    updateHearts() {
        let hearts = "";

        for (let i = 0; i < this.lives; i++) {
            hearts += "❤ ";
        }

        this.heartsText.setText(hearts.trim());
    }

    updateScore(delta) {
        const dt = delta / 1000;
        this.distanceCounter += this.ground.holeSpeed * dt;
        this.score = Math.floor(this.distanceCounter / 100);
        this.scoreText.setText(`Score: ${this.score}`);
    }

    loseLife() {
        if (this.cheatEnabled) {
            return;
        }

        if (this.isRecovering || this.isGameOver) {
            return;
        }

        this.isRecovering = true;
        this.lives -= 1;
        this.updateHearts();

        if (this.lives <= 0) {
            this.isGameOver = true;

            const isNewHighscore = this.score > this.highscore;

            if (isNewHighscore) {
                this.highscore = this.score;
            }

            this.time.delayedCall(400, () => {
                this.scene.start("GameOverScene", {
                    score: this.score,
                    highscore: this.highscore,
                    isNewHighscore
                });
            });

            return;
        }

        if (this.recoverTimer) {
            this.recoverTimer.remove(false);
        }

        this.recoverTimer = this.time.delayedCall(600, () => {
            this.player.resetToGround(this.groundY);
            this.isRecovering = false;
            this.recoverTimer = null;
        });
    }

    stompDog() {
        this.player.vy = -420;
    }

    attackDog() {
        this.player.vy = Math.min(this.player.vy, -120);
    }

    getPlayerBounds() {
        return {
            left: this.player.x - 26,
            right: this.player.x + 26,
            top: this.player.container.y - this.player.height,
            bottom: this.player.container.y
        };
    }

    update(_, delta) {
        this.background.update(delta);

        if (!this.hasStarted || this.isGameOver) {
            return;
        }

        this.ground.update(delta);
        this.ground.draw();
        this.updateScore(delta);

        const footLeftX = this.player.x - 16;
        const footRightX = this.player.x + 16;

        const leftFootOnGround = this.ground.hasGroundAtX(footLeftX);
        const rightFootOnGround = this.ground.hasGroundAtX(footRightX);

        const landingDepthTolerance = 10;
        const isStillNearGroundTop =
            this.player.container.y <= this.groundY + landingDepthTolerance;

        const canLand = () => {
            return (leftFootOnGround || rightFootOnGround) && isStillNearGroundTop;
        };

        this.player.update(delta, this.groundY, canLand);

        this.dogs.update(
            delta,
            this.getPlayerBounds(),
            this.player.vy,
            this.player.getAttackBounds(),
            () => {
                if (!this.cheatEnabled) {
                    this.loseLife();
                }
            },
            () => this.stompDog(),
            () => this.attackDog(),
            !this.isRecovering && !this.cheatEnabled
        );

        if (this.player.container.y > this.scale.height + 40) {
            if (this.isInvincible()) {
                this.player.x = 220;
                this.player.container.x = this.player.x;
                this.player.resetToGround(this.groundY);
                this.player.vy = 0;
                this.isRecovering = false;

                if (this.recoverTimer) {
                    this.recoverTimer.remove(false);
                    this.recoverTimer = null;
                }
            } else {
                this.loseLife();
            }
        }
    }
}