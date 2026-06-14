export default class Dogs {
    constructor(scene, ground, groundY) {
        this.scene = scene;
        this.ground = ground;
        this.groundY = groundY;

        this.dogs = [];
        this.maxDogsOnScreen = 2;

        this.dogHalfWidth = 26;
        this.edgeMargin = 30;

        this.turnCooldown = 180;
        this.turnInset = 14;

        this.scheduleNextSpawn();
    }

    scheduleNextSpawn() {
        const delay = 1400 + Math.random() * 1600;

        this.scene.time.delayedCall(delay, () => {
            const activeDogs = this.dogs.filter(
                (dog) => dog.container && dog.container.active
            ).length;

            if (activeDogs < this.maxDogsOnScreen) {
                this.spawnDog();
            }

            this.scheduleNextSpawn();
        });
    }

    getRandomSpeed() {
        return 70 + Math.random() * 45;
    }

    isSafeSpawnX(x) {
        // kompletter Hund steht sicher
        const bodyPoints = [x - 24, x - 12, x, x + 12, x + 24];

        for (const px of bodyPoints) {
            if (!this.ground.hasGroundAtX(px)) {
                return false;
            }
        }

        // auch vor dem Hund muss noch etwas Boden sein,
        // damit er nicht direkt über einem Loch "reinschwebt"
        const aheadPoints = [x - 36, x - 48, x - 60];

        for (const px of aheadPoints) {
            if (!this.ground.hasGroundAtX(px)) {
                return false;
            }
        }

        return true;
    }

    findSafeSpawnX() {
        const startX = this.scene.scale.width + 140;
        const endX = this.scene.scale.width + 40;

        for (let x = startX; x >= endX; x -= 8) {
            if (this.isSafeSpawnX(x)) {
                return x;
            }
        }

        return null;
    }

    spawnDog() {
        const x = this.findSafeSpawnX();

        if (x === null) {
            return;
        }

        const y = this.groundY;
        const speed = this.getRandomSpeed();
        const direction = -1;

        const dog = this.createDog(x, y, speed, direction);
        this.dogs.push(dog);
    }

    createDog(x, y, speed, direction) {
        const container = this.scene.add.container(x, y);

        const p = 4;
        const parts = [];

        const add = (px, py, w, h, color) => {
            const rect = this.scene.add.rectangle(px, py, w, h, color).setOrigin(0, 0);
            parts.push(rect);
            return rect;
        };

        const tail = add(-28, -42, p * 2, p * 1, 0x8d6e63);

        add(-12, -40, p * 9, p * 4, 0xa66a43);
        add(-8, -36, p * 5, p * 2, 0xc48a63);

        add(24, -40, p * 1, p * 3, 0x8d6e63);
        add(24, -44, p * 4, p * 4, 0xa66a43);
        add(28, -40, p * 2, p * 2, 0x8d6e63);

        add(24, -48, p * 1, p * 2, 0x5d4037);
        add(26, -42, p * 1, p * 1, 0x111111);
        add(31, -39, p * 1, p * 1, 0x111111);

        const leg1 = add(-8, -24, p * 2, p * 5, 0x6d4c41);
        const leg2 = add(0, -24, p * 2, p * 5, 0x6d4c41);
        const leg3 = add(10, -24, p * 2, p * 5, 0x6d4c41);
        const leg4 = add(18, -24, p * 2, p * 5, 0x6d4c41);

        const paw1 = add(-8, -4, p * 2, p * 1, 0x222222);
        const paw2 = add(0, -4, p * 2, p * 1, 0x222222);
        const paw3 = add(10, -4, p * 2, p * 1, 0x222222);
        const paw4 = add(18, -4, p * 2, p * 1, 0x222222);

        container.add(parts);

        const dog = {
            container,
            speed,
            direction,
            width: 52,
            height: 48,
            tail,
            leg1,
            leg2,
            leg3,
            leg4,
            paw1,
            paw2,
            paw3,
            paw4,

            state: "walk",
            removeAt: 0,
            turnLockedUntil: 0,

            hasFullyEnteredScreen: false,
            spawnProtected: true
        };

        this.setDirection(dog, direction);

        return dog;
    }

    setDirection(dog, direction) {
        dog.direction = direction;
        dog.container.setScale(direction < 0 ? -1 : 1, 1);
    }

    resetDog(dog) {
        if (dog.container) {
            dog.container.destroy();
        }
    }

    getDogBounds(dog) {
        return {
            left: dog.container.x - this.dogHalfWidth,
            right: dog.container.x + this.dogHalfWidth,
            top: dog.container.y - 48,
            bottom: dog.container.y
        };
    }

    overlapsRect(a, b) {
        return !(
            a.right < b.left ||
            a.left > b.right ||
            a.bottom < b.top ||
            a.top > b.bottom
        );
    }

    overlapsPlayer(dog, playerBounds) {
        return this.overlapsRect(this.getDogBounds(dog), playerBounds);
    }

    isDogStomped(dog, playerBounds, playerVy) {
        const d = this.getDogBounds(dog);

        const horizontalOverlap =
            playerBounds.right > d.left + 6 &&
            playerBounds.left < d.right - 6;

        const playerIsFalling = playerVy > 0;

        const playerBottomNearDogTop =
            playerBounds.bottom >= d.top &&
            playerBounds.bottom <= d.top + 18;

        return horizontalOverlap && playerIsFalling && playerBottomNearDogTop;
    }

    isFullySupported(x) {
        const points = [x - 20, x - 10, x, x + 10, x + 20];

        for (const px of points) {
            if (!this.ground.hasGroundAtX(px)) {
                return false;
            }
        }

        return true;
    }

    hasGroundUnderBody(x) {
        const points = [x - 18, x - 8, x + 8, x + 18];

        for (const px of points) {
            if (!this.ground.hasGroundAtX(px)) {
                return false;
            }
        }

        return true;
    }

    hasGroundAhead(x, direction) {
        const points =
            direction < 0
                ? [x - 24, x - 18, x - 10]
                : [x + 10, x + 18, x + 24];

        for (const px of points) {
            if (!this.ground.hasGroundAtX(px)) {
                return false;
            }
        }

        return true;
    }

    hitsTurnEdge(x, direction) {
        const left = x - this.dogHalfWidth;
        const right = x + this.dogHalfWidth;
        const width = this.scene.scale.width;

        if (direction < 0) {
            return left <= this.edgeMargin;
        }

        if (direction > 0) {
            return right >= width - this.edgeMargin;
        }

        return false;
    }

    tryTurnAround(dog) {
        const now = this.scene.time.now;

        if (now < dog.turnLockedUntil) {
            return;
        }

        const newDirection = dog.direction < 0 ? 1 : -1;

        this.setDirection(dog, newDirection);
        dog.speed = this.getRandomSpeed();
        dog.turnLockedUntil = now + this.turnCooldown;

        dog.container.x += newDirection * this.turnInset;

        for (let i = 0; i < 4; i++) {
            if (
                !this.hitsTurnEdge(dog.container.x, newDirection) &&
                this.hasGroundUnderBody(dog.container.x) &&
                this.hasGroundAhead(dog.container.x, newDirection)
            ) {
                break;
            }

            dog.container.x += newDirection * this.turnInset;
        }
    }

    hitDog(dog) {
        dog.state = "hit";
        dog.removeAt = this.scene.time.now + 140;

        const pushBack = 28;
        dog.container.x += -dog.direction * pushBack;

        this.updateDogAnimation(dog, false);
        dog.tail.rotation = -0.2;
    }

    updateDogAnimation(dog, isMoving) {
        if (isMoving) {
            const t = this.scene.time.now / 120 + dog.speed / 100;

            dog.leg1.y = -24 + Math.sin(t) * 3;
            dog.leg2.y = -24 + Math.cos(t) * 3;
            dog.leg3.y = -24 + Math.cos(t) * 3;
            dog.leg4.y = -24 + Math.sin(t) * 3;

            dog.paw1.y = -4 + Math.sin(t) * 1.5;
            dog.paw2.y = -4 + Math.cos(t) * 1.5;
            dog.paw3.y = -4 + Math.cos(t) * 1.5;
            dog.paw4.y = -4 + Math.sin(t) * 1.5;

            dog.tail.rotation = Math.sin(t) * 0.2;
        } else {
            dog.leg1.y = -24;
            dog.leg2.y = -24;
            dog.leg3.y = -24;
            dog.leg4.y = -24;

            dog.paw1.y = -4;
            dog.paw2.y = -4;
            dog.paw3.y = -4;
            dog.paw4.y = -4;
        }
    }

    updateHitDog(dog) {
        if (this.scene.time.now >= dog.removeAt) {
            this.resetDog(dog);
            return false;
        }

        return true;
    }

    update(
        delta,
        playerBounds,
        playerVy,
        attackBounds,
        onHitPlayer,
        onDogStomped,
        onDogAttacked,
        canHitPlayer = true
    ) {
        const dt = delta / 1000;
        const remaining = [];

        for (const dog of this.dogs) {
            if (!dog.container || !dog.container.active) {
                continue;
            }

            if (dog.state === "hit") {
                if (this.updateHitDog(dog)) {
                    remaining.push(dog);
                }
                continue;
            }

            const worldDrift = -this.ground.holeSpeed * dt;
            const localWalk = dog.direction * dog.speed * dt;

            if (!dog.hasFullyEnteredScreen) {
                dog.container.x += worldDrift + localWalk;
                dog.container.y = this.groundY;
                this.updateDogAnimation(dog, true);

                const fullyVisibleLeft = dog.container.x - this.dogHalfWidth >= 0;
                const fullyOnGround = this.isFullySupported(dog.container.x);

                if (fullyVisibleLeft && fullyOnGround) {
                    dog.hasFullyEnteredScreen = true;
                    dog.spawnProtected = false;
                }

                if (dog.container.x < -140) {
                    this.resetDog(dog);
                    continue;
                }

                const dogBounds = this.getDogBounds(dog);

                if (attackBounds && this.overlapsRect(dogBounds, attackBounds)) {
                    onDogAttacked();
                    this.hitDog(dog);
                    remaining.push(dog);
                    continue;
                }

                if (this.overlapsPlayer(dog, playerBounds)) {
                    if (this.isDogStomped(dog, playerBounds, playerVy)) {
                        onDogStomped(dog);
                        this.resetDog(dog);
                        continue;
                    }

                    if (canHitPlayer) {
                        onHitPlayer();
                        this.resetDog(dog);
                        continue;
                    }
                }

                remaining.push(dog);
                continue;
            }

            const proposedX = dog.container.x + worldDrift + localWalk;

            const unsupportedBody = !this.hasGroundUnderBody(proposedX);
            const unsupportedAhead = !this.hasGroundAhead(proposedX, dog.direction);
            const blockedByEdge = this.hitsTurnEdge(proposedX, dog.direction);

            if (blockedByEdge || unsupportedBody || unsupportedAhead) {
                dog.container.x += worldDrift;
                this.tryTurnAround(dog);
            } else {
                dog.container.x = proposedX;
            }

            dog.container.y = this.groundY;
            this.updateDogAnimation(dog, true);

            if (dog.container.x < -120 || dog.container.x > this.scene.scale.width + 140) {
                this.resetDog(dog);
                continue;
            }

            const dogBounds = this.getDogBounds(dog);

            if (attackBounds && this.overlapsRect(dogBounds, attackBounds)) {
                onDogAttacked();
                this.hitDog(dog);
                remaining.push(dog);
                continue;
            }

            if (this.overlapsPlayer(dog, playerBounds)) {
                if (this.isDogStomped(dog, playerBounds, playerVy)) {
                    onDogStomped(dog);
                    this.resetDog(dog);
                    continue;
                }

                if (canHitPlayer) {
                    onHitPlayer();
                    this.resetDog(dog);
                    continue;
                }
            }

            remaining.push(dog);
        }

        this.dogs = remaining;
    }
}