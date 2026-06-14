export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.startY = y;

        this.vy = 0;
        this.gravity = 1800;
        this.jumpStrength = 760;

        this.scaleFactor = 0.7;
        this.width = 54;
        this.height = 104;

        this.isAttacking = false;
        this.attackUntil = 0;
        this.attackStart = 0;
        this.attackDuration = 220;

        this.container = this.createPlayer();
    }

    createPlayer() {
        const container = this.scene.add.container(this.x, this.startY);

        const sprite = this.scene.add.container(0, -35);
        sprite.setScale(this.scaleFactor);

        const p = 4;
        this.parts = {};

        const make = (x, y, w, h, c) =>
            this.scene.add.rectangle(x, y, w, h, c).setOrigin(0, 0);

        const add = (name, x, y, w, h, c) => {
            const part = make(x, y, w, h, c);
            this.parts[name] = part;
            return part;
        };

        const parts = [];

        const skin = 0x49b749;
        const skinLight = 0x6fcd63;
        const skinDark = 0x2f8f35;
        const hair = 0x4b2e14;
        const hairDark = 0x2f1b0c;
        const pants = 0x3f004f;
        const pantsLight = 0x5a0b6d;
        const black = 0x000000;
        const white = 0xf5f5f5;
        const shadow = 0x2a7c2f;

        parts.push(add("hairTop", -24, -100, p * 12, p * 2, hair));
        parts.push(add("hairTop2", -20, -92, p * 10, p * 2, hair));
        parts.push(add("hairLeft", -28, -88, p * 2, p * 5, hairDark));
        parts.push(add("hairBack", -20, -84, p * 9, p * 1, hairDark));

        parts.push(add("head", -20, -84, p * 10, p * 8, skin));
        parts.push(add("jaw", -16, -56, p * 8, p * 1, skinDark));

        parts.push(add("browLeft", -16, -76, p * 3, p * 1, black));
        parts.push(add("browRight", 4, -76, p * 3, p * 1, black));
        // Augen (weiß)
        parts.push(add("eyeLeftWhite", -16, -72, p * 3, p * 3, white));
        parts.push(add("eyeRightWhite", 4, -72, p * 3, p * 3, white));

        // Pupillen (klein & mittig)
        parts.push(add("eyeLeftPupil", -13, -71, p * 1, p * 1, black));
        parts.push(add("eyeRightPupil", 7, -71, p * 1, p * 1, black));

        // kleiner Lichtreflex
        parts.push(add("eyeLeftShine", -12, -71, p * 1, p * 1, white));
        parts.push(add("eyeRightShine", 8, -71, p * 1, p * 1, white));

        parts.push(add("mouth", -12, -52, p * 6, p * 2, 0x222222));

        parts.push(add("neck", -8, -44, p * 4, p * 2, skin));

        parts.push(add("body", -24, -44, p * 12, p * 10, skin));
        parts.push(add("chest", -20, -40, p * 10, p * 3, skinLight));
        parts.push(add("torsoShade", -24, -8, p * 12, p * 1, shadow));

        parts.push(add("pec1", -16, -28, p * 3, p * 1, skinDark));
        parts.push(add("pec2", 0, -28, p * 3, p * 1, skinDark));

        parts.push(add("ab1", -12, -20, p * 2, p * 1, skinDark));
        parts.push(add("ab2", 0, -20, p * 2, p * 1, skinDark));
        parts.push(add("ab3", -12, -12, p * 2, p * 1, skinDark));
        parts.push(add("ab4", 0, -12, p * 2, p * 1, skinDark));
        parts.push(add("ab5", -12, -4, p * 2, p * 1, skinDark));
        parts.push(add("ab6", 0, -4, p * 2, p * 1, skinDark));

        parts.push(add("leftShoulder", -32, -40, p * 2, p * 3, skin));
        parts.push(add("leftUpperArm", -36, -32, p * 3, p * 5, skin));
        parts.push(add("leftForeArm", -40, -12, p * 3, p * 4, skinDark));
        parts.push(add("leftHand", -40, 4, p * 2, p * 2, skin));

        parts.push(add("rightUpperArm", 24, -36, p * 3, p * 5, skin));
        parts.push(add("rightForeArm", 32, -20, p * 3, p * 4, skinDark));
        parts.push(add("rightHand", 36, -32, p * 2, p * 2, skin));

        parts.push(add("pantsMain", -20, -4, p * 10, p * 8, pants));
        parts.push(add("pantsLight1", -20, 4, p * 3, p * 2, pantsLight));
        parts.push(add("pantsLight2", 8, 0, p * 2, p * 3, pantsLight));

        parts.push(add("leftLeg", -16, 20, p * 3, p * 7, skin));
        parts.push(add("rightLeg", 0, 20, p * 3, p * 7, skin));

        parts.push(add("leftLegShade", -16, 36, p * 3, p * 1, skinDark));
        parts.push(add("rightLegShade", 0, 36, p * 3, p * 1, skinDark));

        parts.push(add("leftFoot", -20, 48, p * 4, p * 2, skin));
        parts.push(add("rightFoot", 0, 48, p * 4, p * 2, skin));

        // Schlag-Effekt
        const punchFlash = add("punchFlash", 56, -28, p * 4, p * 3, 0xf7f39a);
        punchFlash.setVisible(false);

        sprite.add(parts);
        container.add(sprite);

        this.sprite = sprite;
        this.punchFlash = punchFlash;

        this.animatedParts = {
            leftArm: this.parts.leftForeArm,
            rightArm: this.parts.rightForeArm,
            leftHand: this.parts.leftHand,
            rightHand: this.parts.rightHand,
            leftLeg: this.parts.leftLeg,
            rightLeg: this.parts.rightLeg,
            leftFoot: this.parts.leftFoot,
            rightFoot: this.parts.rightFoot
        };

        return container;
    }

    jump(groundY) {
        if (this.isOnGround(groundY)) {
            this.vy = -this.jumpStrength;
        }
    }

    attack() {
        if (this.isAttacking) {
            return;
        }

        this.isAttacking = true;
        this.attackStart = this.scene.time.now;
        this.attackUntil = this.attackStart + this.attackDuration;
    }

    isOnGround(groundY) {
        return Math.abs(this.container.y - groundY) < 2;
    }

    resetToGround(groundY) {
        this.container.y = groundY;
        this.vy = 0;
    }

    getAttackBounds() {
        if (!this.isAttacking) {
            return null;
        }

        return {
            left: this.x + 12,
            right: this.x + 112,
            top: this.container.y - 92,
            bottom: this.container.y - 8
        };
    }

    update(delta, groundY, canLand) {
        const dt = delta / 1000;

        this.vy += this.gravity * dt;
        this.container.y += this.vy * dt;

        if (this.isAttacking && this.scene.time.now >= this.attackUntil) {
            this.isAttacking = false;
        }

        const onGround = Math.abs(this.container.y - groundY) < 8;

        const t = this.scene.time.now / 120;

        if (onGround) {
            this.animatedParts.leftLeg.y = 20 + Math.sin(t) * 3;
            this.animatedParts.rightLeg.y = 20 + Math.cos(t) * 3;

            this.animatedParts.leftFoot.y = 48 + Math.sin(t) * 2;
            this.animatedParts.rightFoot.y = 48 + Math.cos(t) * 2;

            this.animatedParts.leftArm.y = -12 + Math.sin(t) * 2;
            this.animatedParts.leftHand.y = 4 + Math.sin(t) * 2;
        } else {
            this.animatedParts.leftLeg.y = 20;
            this.animatedParts.rightLeg.y = 20;

            this.animatedParts.leftFoot.y = 48;
            this.animatedParts.rightFoot.y = 48;

            this.animatedParts.leftArm.y = -12;
            this.animatedParts.leftHand.y = 4;
        }

        if (this.isAttacking) {
            const progress =
                (this.scene.time.now - this.attackStart) / this.attackDuration;

            let punch = 0;
            if (progress < 0.35) {
                punch = progress / 0.35;
            } else {
                punch = 1 - (progress - 0.35) / 0.65;
            }

            punch = Math.max(0, Math.min(1, punch));

            this.sprite.x = punch * 10;

            this.animatedParts.rightArm.x = 32 + punch * 28;
            this.animatedParts.rightHand.x = 36 + punch * 44;
            this.animatedParts.rightArm.y = -20 - punch * 8;
            this.animatedParts.rightHand.y = -32 + punch * 6;

            this.punchFlash.x = 56 + punch * 36;
            this.punchFlash.y = -28 - punch * 2;
            this.punchFlash.setVisible(punch > 0.45);
            this.punchFlash.scaleX = 1 + punch * 0.8;
            this.punchFlash.scaleY = 1 + punch * 0.5;
        } else {
            this.sprite.x = 0;

            if (onGround) {
                this.animatedParts.rightArm.x = 32;
                this.animatedParts.rightHand.x = 36;
                this.animatedParts.rightArm.y = -20 + Math.cos(t) * 2;
                this.animatedParts.rightHand.y = -32 + Math.cos(t) * 2;
            } else {
                this.animatedParts.rightArm.x = 32;
                this.animatedParts.rightHand.x = 36;
                this.animatedParts.rightArm.y = -20;
                this.animatedParts.rightHand.y = -32;
            }

            this.punchFlash.setVisible(false);
        }

        if (this.container.y >= groundY && canLand()) {
            this.container.y = groundY;
            this.vy = 0;
        }
    }
}