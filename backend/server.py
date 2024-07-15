import json
import logging
import os
import uuid
from typing import Dict
from random import randint

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from enum import Enum


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Set up a file handler for connections.log
file_handler = logging.FileHandler('logs/connections.log')
file_handler.setLevel(logging.INFO)
file_formatter = logging.Formatter('%(asctime)s - %(message)s')
file_handler.setFormatter(file_formatter)
logger.addHandler(file_handler)

class ConnectionManager:
    def __init__(self):
        self.connected_clients: Dict[str, WebSocket] = {}
        self.player_list: Dict[str, Dict] = {}

    def print_ips(self):
        ips = [websocket.client.host for websocket in self.connected_clients.values()]
        print(f"List of connected client IPs: {ips}")

    async def connect(self, websocket: WebSocket) -> str:
        await websocket.accept()
        client_id = str(uuid.uuid4())
        self.connected_clients[client_id] = websocket
        self.print_ips()
        return client_id

    async def disconnect(self, client_id: str):
        print(f"DISCONNECTING PLAYER {client_id}")
        websocket = self.connected_clients.get(client_id)

        if websocket:
            try:
                await websocket.close()
            except Exception as e:
                print(f"Error closing WebSocket for client {client_id}: {e}")

        del self.connected_clients[client_id]
        del self.player_list[client_id]
        await self.broadcast_disconnect(client_id)
        self.print_ips()

    async def send_message(self, client_id: str, message: dict):
        websocket = self.connected_clients.get(client_id)
        if websocket:
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                print(f"Error sending message to client {client_id}: {e}")

    async def broadcast_message(self, message: dict):
        """
        Send a message to all connected clients. message should be a dict (JSON obj)
        """
        message_str = json.dumps(message)
        print("Broadcasting message to everyone:", message_str)
        disconnected_clients = []
        for client_id, websocket in self.connected_clients.items():
            try:
                await websocket.send_text(message_str)
            except Exception as e:
                print(f"Error sending message to client {client_id}: {e}")
                disconnected_clients.append(client_id)
        
        # Remove disconnected clients from the list
        for client_id in disconnected_clients:
            await self.disconnect(client_id)

    async def broadcast_player_data(self):
        message = {
            "type": "update_players",
            "players": self.player_list
        }
        await self.broadcast_message(message)

    async def broadcast_disconnect(self, client_id: str):
        message = {
            "type": "disconnect_player",
            "client_id": client_id
        }
        await self.broadcast_message(message)

    async def handle_message(self, client_id: str, message: Dict[str, any]):
        handlers = {
            "new_main_player": self.handle_new_main_player,
            "move_player": self.handle_move_player,
            "chat_message": self.handle_chat_message,
        }
        handler = handlers.get(message["type"])
        if handler:
            await handler(client_id, message['data'])
        else:
            print(f"Unknown message type: {message['type']}")
    
    async def handle_new_main_player(self, client_id: str, data: Dict[str, any]):
        player = {
            'x': 100,
            'y': 100,
            'velocity_x': 0,
            'velocity_y': 0,
            'name': data['name']
        }
        self.player_list[client_id] = player
        out_message = {
            "type": "new_main_player",
            "client_id": client_id,
            "player": player
        }
        await self.send_message(client_id, out_message)
        await self.broadcast_player_data()
        
        # Log the new main player to connections.log
        logger.info(f"New main player connected. Name: {data['name']}")
    
    async def handle_move_player(self, client_id: str, data: Dict[str, any]):
        if client_id not in self.player_list:
            print("wtf player not found")
            return
        player = self.player_list.get(client_id, {})
        player['x'] = data.get('x', player.get('x', 0))
        player['y'] = data.get('y', player.get('y', 0))
        player['velocity_x'] = data.get('velocity_x', player.get('velocity_x', 0))
        player['velocity_y'] = data.get('velocity_y', player.get('velocity_y', 0))
        self.player_list[client_id] = player

        out_message = {
            "type": "update_players",
            "players": {client_id:player}
        }
        await self.broadcast_message(out_message)
    
    async def handle_chat_message(self, client_id: str, data: Dict[str, any]):
        pass
    

app = FastAPI()
manager = ConnectionManager()

server_directory = os.path.dirname(os.path.abspath(__file__))
print(f"Current working directory: {server_directory}")
static_directory = os.path.join(server_directory, "static")
if not os.path.exists(static_directory):
    raise RuntimeError(f"Directory '{static_directory}' does not exist")

app.mount("/static", StaticFiles(directory=static_directory), name="static")

@app.get("/")
async def get_index():
    index_path = os.path.join(static_directory, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        return {"error": "index.html not found"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    client_id = await manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            print(f"Received message. JSON: {message}")
            await manager.handle_message(client_id, message)
    except WebSocketDisconnect:
        print(f"WebSocket connection closed by {client_id}")
        await manager.disconnect(client_id)

# The following block is only for local development purposes.
# When deploying with a production server, this block is not used.
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True, log_level="info")
