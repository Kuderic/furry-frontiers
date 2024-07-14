import Phaser from "phaser";

export default class NetworkManager {
    constructor() {
        this.socket = undefined;
        this.callbacks = {};
    }

    getProperSocketURL() {
        // Determine WebSocket URL based on the environment
        let socketUrl;
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            socketUrl = "ws://localhost:8000/ws"; // Local server
        } else {
            socketUrl = "wss://furryfrontiers.com/ws"; // Production server
        }
        return socketUrl;
    }

    connect() {
        const socketUrl = this.getProperSocketURL();
        this.socket = new WebSocket(socketUrl);
        
        return /** @type {Promise<void>} */(new Promise((resolve, reject) => {
            this.socket.onopen = () => {
                console.log("WebSocket Connection Established");
                resolve();
            };

            this.socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            };

            this.socket.onclose = (event) => {
                console.log("WebSocket Connection Closed", event);
                reject(new Error("WebSocket connection closed"));
            };

            this.socket.onerror = (error) => {
                console.error("WebSocket error:", error);
                reject(error);
            };
        }));

    }

    /**
     * @param {any} type
     * @param {any} data
     */
    async sendMessage(type, data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ type, data });
            this.socket.send(message);
        } else {
            console.error('WebSocket is not open');
        }
    }

    /**
     * @param {any} msg
     */
    handleMessage(data) {
        console.log("Message received: ", data);
        const type = data.type;
        if (this.callbacks[type]) {
            this.callbacks[type](data);
        } else {
            console.warn(`No handler for message type: ${type}`);
        }
    }

    /**
     * @param {string | number} type
     * @param {any} callback
     */
    on(type, callback) {
        this.callbacks[type] = callback;
    }
    /**
     * @param {string | number} type
     * @param {any} callback
     */
    off(type, callback) {
        delete this.callbacks[type];
    }
}