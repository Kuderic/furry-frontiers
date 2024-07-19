import Phaser from 'phaser';
import Player from '../utils/player';
import GrassGenerator from '../utils/grass-generator';
import NetworkManager from '../utils/network-manager';

import expBar from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 2000;
const MOBILE_ZOOM_SCALE = 0.7;
const THROTTLE_INTERVAL = 100;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.players = {};
        this.lastSentTime = 0;
        this.lastSentVelocity = {x:0, y:0};
    }
    
    preload() {
    }

    async create() {
        if (this.input.mouse) {
            this.input.mouse.disableContextMenu();
        }
        this.cameras.main.setBackgroundColor('#457237');
        this.isMobile = this.registry.get('isMobile');
        // this.isMobile = true;

        this.createGameUI();
        await this.createNetworkManager();
        this.setBounds();
        this.generateWorld();
        this.setUpCamera();
        this.setUpControls();

        // Attach sendMessage to the window object
        this.setUpChatBox();
    }

    update() {
        this.updatePlayer();
    }

    handleEnterPress() {
        console.log('Enter key pressed');
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            if (document.activeElement === messageInput) {
                this.sendChatMessage();
                messageInput?.blur();
            } else {
                messageInput?.focus();
            }
        }
    }

    setUpChatBox() {
        this.showChatBox();
        
        // @ts-ignore
        window.chatFormSubmit = this.chatFormSubmit.bind(this);

        const messageInput = document.getElementById('messageInput');
        if (!messageInput) {
            console.error("Message Input box not found");
            return;
        }

        messageInput.addEventListener('focus', this.onMessageInputFocus.bind(this));
        messageInput.addEventListener('blur', this.onMessageInputBlur.bind(this));

        document.getElementById('gameContainer')?.addEventListener('click', () => {
            console.log("GAME CLICKED")
            // If gameContainer is clicked, then unfocus chat box
            const activeElement = document.activeElement;
            if (activeElement && activeElement.tagName === 'INPUT') {
                activeElement.blur();
            }
        });
    }

    /**
     * @param {{ preventDefault: () => void; }} event
     */
    chatFormSubmit(event) {
        console.log("chat form submit");
        event.preventDefault();
        this.sendChatMessage();
    }

    showChatBox() {
        let chatBox = document.getElementById('chatBox');
        if (chatBox) {
            chatBox.style.display = 'block'
        }
    }
    
    onMessageInputFocus() {
        console.log("input focused");
        this.isTyping = true;
    }

    onMessageInputBlur() {
        console.log("input blurred");
        this.isTyping = false;
    }

    async createNetworkManager() {
        this.networkManager = new NetworkManager();

        await this.networkManager.connect();
        await this.sendNewPlayerMessage();

        this.networkManager.on('new_main_player', this.createNewMainPlayerHandler.bind(this));
        this.networkManager.on('update_players', this.updatePlayersHandler.bind(this));
        this.networkManager.on('disconnect_player', this.disconnectPlayerHandler.bind(this));
        this.networkManager.on('chat_message', this.createChatMessageHandler.bind(this));
        // this.networkManager.on('player_data', playerDataHandler.bind(this));
    }

    async sendChatMessage() {
        let messageInput = document.getElementById("messageInput");
        if (messageInput?.value === '') {
            return;
        }
        console.log("Sending chat message");
        await this.networkManager?.sendMessage(
            'chat_message',
            {
                'message': messageInput.value
            }
        )
        messageInput.value = ''; // Clear the input field after sending the message
    }

    async sendNewPlayerMessage() {
        console.log("Sending new player message");
        await this.networkManager?.sendMessage(
            'new_main_player',
            {
                name: this.registry.get('playerName')
            }
        )
    }

    async sendMovePlayerMessage() {
        await this.networkManager?.sendMessage('move_player', {
            x: this.player?.x,
            y: this.player?.y,
            velocity_x: this.player?.body?.velocity.x,
            velocity_y: this.player?.body?.velocity.y,
        })
    }

    setUpCamera() {
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        // Make the camera zoom out more on mobile
        if (this.isMobile) {
            this.cameras.main.setZoom(MOBILE_ZOOM_SCALE);
        }
    }

    createGameUI() {
        this.scene.launch('GameUIScene');
        this.uiScene = this.scene.get('GameUIScene');
    }

    setBounds() {
        this.physics.world.bounds.width = WORLD_WIDTH;
        this.physics.world.bounds.height = WORLD_HEIGHT;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {string} [name]
     * @param {string} [texture]
     */
    createMainPlayer(x, y, name, texture='bunny1') {
        this.player = new Player(this, x, y, texture, name);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        // @ts-ignore
        this.uiScene?.createMinimapCamera();
        this.displayServerMessage(`${this.player.name} has connected to the game.`);
    }

    addKeyboardInput() {
        this.keys = this.input.keyboard?.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
            'enter': Phaser.Input.Keyboard.KeyCodes.ENTER
            },
            false
        )

        this.keys.enter.on('down', this.handleEnterPress.bind(this));
    }

    addMouseInput() {
        this.input.on('pointerdown', (/** @type {{ x: number; y: any; }} */ pointer) => {
            if (this.input.mousePointer.rightButtonDown()) {
                console.log("Attacking = true")
                this.attacking = true;
            }
        })
        this.input.on('pointerup', (/** @type {{ x: number; y: any; }} */ pointer) => {
            if (this.input.mousePointer.rightButtonReleased()) {
                console.log("Attacking = false")
                this.attacking = true;
            }
        })
    }

    generateWorld() {
        console.log("generating grass");
        this.grassGenerator = new GrassGenerator(this);
        this.grassGenerator.generateGrass();
    }

    setUpControls() {
        this.addZoomControls();
        if (this.isMobile) {
            this.createJoySticks();
        } else {
            this.addMouseInput();
            this.addKeyboardInput();
        }
    }

    addZoomControls() {
        this.input.on("wheel",  (/** @type {any} */ pointer, /** @type {any} */ gameObjects, /** @type {any} */ deltaX, /** @type {number} */ deltaY, /** @type {any} */ deltaZ) => {
            const camera = this.cameras.main;
            if (deltaY > 0) {
                var newZoom = camera.zoom -.1;
                if (newZoom > 0.6) {
                    camera.zoom = newZoom;     
                }
            }
            
            if (deltaY < 0) {
                var newZoom = camera.zoom +.1;
                if (newZoom < 1.3) {
                    camera.zoom = newZoom;     
                }
            }

            // this.camera.centerOn(pointer.worldX, pointer.worldY);
            // this.camera.pan(pointer.worldX, pointer.worldY, 2000, "Power2");
            
        });
    }

    startAttacking() {
        console.log("start attacking");
        this.attacking = true;
    }

    stopAttacking() {
        console.log("stop attacking");
        this.attacking = false;
    }

    createJoySticks() {
        const JOYSTICK_DIVIDER_RATIO = 0.6;
        const rexPlugin = this.plugins.get('rexVirtualJoystick');
        if (!rexPlugin) {
            throw new Error("rexVirtualJoystick plugin not loaded");
        }
        const GameUIScene = this.scene.get('GameUIScene');

        this.movementJoyStick = rexPlugin.add(GameUIScene, {
            x: 100,
            y: GameUIScene.cameras.main.height - 125,
            radius: 40,
            forceMin: 0,
            base: GameUIScene.add.circle(0, 0, 40, 0x888888).setDepth(100).setAlpha(0.25),
            thumb: GameUIScene.add.image(0, 0, 'joystick').setDisplaySize(60, 60).setDepth(100).setAlpha(0.5),
        }).on('update', () => {}, this)
        
        this.shootJoyStick = rexPlugin.add(GameUIScene, {
            x: GameUIScene.cameras.main.width - 100,
            y: GameUIScene.cameras.main.height - 125,
            radius: 20,
            forceMin: 0,
            base: GameUIScene.add.circle(0, 0, 40, 0x888888, 0.5).setDepth(100).setAlpha(0.25),
            thumb: GameUIScene.add.image(0, 0, 'joystick').setDisplaySize(60, 60).setDepth(100).setAlpha(0.5),
        }).on('update', () => {}, this)

        // Move joysticks dynamically based on pointer-down
        this.input.on('pointerdown', (/** @type {{ x: number; y: any; }} */ pointer) => {
            if (pointer.x <= this.cameras.main.width * JOYSTICK_DIVIDER_RATIO) {
              this.movementJoyStick.base.setPosition(pointer.x, pointer.y).setAlpha(0.5)
              this.movementJoyStick.thumb.setPosition(pointer.x, pointer.y).setAlpha(1)
            }
            if (pointer.x >= this.cameras.main.width * JOYSTICK_DIVIDER_RATIO) {
              this.shootJoyStick.base.setPosition(pointer.x, pointer.y).setAlpha(0.5)
              this.shootJoyStick.thumb.setPosition(pointer.x, pointer.y).setAlpha(1)
              this.startAttacking();
            }
          })
        
        // Add transparency to joysticks on pointer-up
        this.input.on('pointerup', (/** @type {any} */ pointer) => {
            if (!this.movementJoyStick.force) {
                this.movementJoyStick.base.setAlpha(0.25)
                this.movementJoyStick.thumb.setAlpha(0.5)
            }
            if (!this.shootJoyStick.force) {
                this.stopAttacking();
                this.shootJoyStick.base.setAlpha(0.25)
                this.shootJoyStick.thumb.setAlpha(0.5)
            }
        });
    }

    updatePlayer() {
        if (!this.player) {
            console.log("Waiting for player to be created");
            return;
        }
        if (!this.isTyping) {
            this.handlePlayerMovement();
        }
    }

    handlePlayerMovement() {
        if (!this.player) {
            throw new Error("no player");
        }
        this.player.setVelocity(0, 0);

        if (this.isMobile) {
            this.handleJoyStickInput();
        } else {
            this.handleKeyboardMovement();
        }

        const velocity = this.player.body?.velocity.length();

        if (velocity !== 0) {
            if (!this.movementSound || !this.movementSound.isPlaying) {
                this.movementSound = this.sound.add("grass-move", {loop : true});
                this.movementSound.play({volume:0.5});
            }
        } else {
            if (this.movementSound && this.movementSound.isPlaying) {
                this.movementSound.pause();
            }
        }

        const currentTime = Date.now();
        if (currentTime - this.lastSentTime > THROTTLE_INTERVAL) {
            if (this.lastSentVelocity.x != this.player.body?.velocity.x ||
                this.lastSentVelocity.y != this.player.body?.velocity.x)
            {
                this.sendMovePlayerMessage();
                this.lastSentTime = currentTime;
                this.lastSentVelocity.x = this.player.body?.velocity.x;
                this.lastSentVelocity.y = this.player.body?.velocity.y;
            }
        }
    }

    handleJoyStickInput() { 
        // Joystick movement
        if (!this.isMobile) {
            console.log("can't handle joysticks on PC");
            return;
        }
        if (!this.player) {
            throw new Error("player not defined");
        }

        let forceX = 0
        let forceY = 0;

        if (this.movementJoyStick.forceX > 0) {
            forceX = Math.min(this.movementJoyStick.forceX / 100, 1);
        } else if (this.movementJoyStick.forceX < 0) {
            forceX = Math.max(this.movementJoyStick.forceX / 100, -1);
        }
        if (this.movementJoyStick.forceY > 0) {
            forceY = Math.min(this.movementJoyStick.forceY / 100, 1);
        } else if (this.movementJoyStick.forceY < 0) {
            forceY = Math.max(this.movementJoyStick.forceY / 100, -1);
        }
        // console.log(forceX, forceY);

        if (forceX || forceY) {
            this.player.setVelocityX(forceX * this.player.speed);
            this.player.setVelocityY(forceY * this.player.speed);
        }
    }

    handleKeyboardMovement() {
        if (!this.player) {
            throw new Error("no player");
        }
        if (this.input.keyboard) {
            if (this.keys.left.isDown) {
                this.player.setVelocityX(-1 * this.player.speed);
            }
            if (this.keys.right.isDown) {
                this.player.setVelocityX(this.player.speed);
            }
            if (this.keys.up.isDown) {
                this.player.setVelocityY(-1 * this.player.speed);
            }
            if (this.keys.down.isDown) {
                this.player.setVelocityY(this.player.speed);
            }
        }
    }

    

    /**
     * @param {string | number} playerId
     * @param {any} message
     */
    displayChatMessage(playerId, message) {
        // this.players[playerId].say(message);

        let messagesList = document.getElementById("messagesList");
        let messageItem = document.createElement("li");
        console.log(this.players);
        let name = this.players[playerId].name;
    
        // Create a timestamp
        let timestamp = new Date().toLocaleTimeString(); // This gives you a human-readable time format
    
        // Include the timestamp in the message text
        messageItem.textContent = `[${timestamp}] ${name}: ${message}`;
    
        // Append the message item to the list
        messagesList.appendChild(messageItem);
        messageItem.className = "chatMessage";
    
        // Call to remove the message item after a delay (10 seconds)
        // removeElementAfterDelay(messageItem, 10000);
        scrollToBottom();
    }

    /**
     * @param {any} message
     */
    displayServerMessage(message) {
        let messagesList = document.getElementById("messagesList");
        let messageItem = document.createElement("li");
        messageItem.className = "serverMessage";
        // Create a timestamp
        let timestamp = new Date().toLocaleTimeString(); // This gives you a human-readable time format
        // Include the timestamp in the message text
        messageItem.textContent = `[${timestamp}] ${message}`;
        // Append the message item to the list
        messagesList.appendChild(messageItem);
        scrollToBottom();
    }

    ////////////////////////////////////////////////////////////////
    //                  NETWORK CALLBACK METHODS
    ////////////////////////////////////////////////////////////////

    
    /**
     * @param {any} data
     */
    createChatMessageHandler(data) {
        const player = this.displayChatMessage(data.client_id, data.message);
    }


    /**
     * @param {any} data
     */
    createNewMainPlayerHandler(data) {
        this.playerId = data.client_id;
        this.createMainPlayer(data.player.x, data.player.y, data.player.name, 'bunny1');
        this.players[data.client_id] = this.player;
        // @ts-ignore
    }

    /**
     * @param {any} data
     */
    updatePlayersHandler(data) {
        // data.players is a dict with key:value where key is playerId and value is player data. 
        for (const playerId in data.players) {
            if (playerId === this.playerId) {
                continue;
            }
            const playerData = data.players[playerId];

            // Check if the player already exists
            if (this.players[playerId]) {
                console.log(`UPDATING PLAYER ${playerData.name}`);
                // Update the existing player's position and other properties
                const player = this.players[playerId];
                player.x = playerData.x;
                player.y = playerData.y;
                player.setPosition(playerData.x, playerData.y);
                player.setVelocityX(playerData.velocity_x);
                player.setVelocityY(playerData.velocity_y);
                // Update other player properties as needed
            } else {
                console.log(`CREATING PLAYER ${playerData.name}`);
                // If the player does not exist, create a new player
                const newPlayer = new Player(this, playerData.x, playerData.y, 'bunny1', playerData.name);
                this.displayServerMessage(`${playerData.name} has connected to the game.`);
                this.players[playerId] = newPlayer;
            }
        }
    }
    
    /**
     * @param {{ client_id: string; }} data
     */
    disconnectPlayerHandler(data) {
        this.displayServerMessage(`${this.players[data.client_id].name} has disconnected.`);
        this.players[data.client_id].destroy();
        delete this.players[data.client_id];
    }
}

document.getElementById('messageInput').addEventListener('click', function(event) {
    event.stopPropagation();
});

document.getElementById('chatBox').addEventListener('wheel', function(event) {
    event.stopPropagation();
    event.preventDefault();
    document.getElementById('messagesList').scrollTop += event.deltaY;
});

function scrollToBottom() {
    const messagesList = document.getElementById('messagesList');
    messagesList.scrollTop = messagesList.scrollHeight;
}
