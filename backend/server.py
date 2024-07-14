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

class MessageType(Enum):
    RED = 1
    GREEN = 2
    BLUE = 3

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
        websocket = self.connected_clients[client_id]
        await websocket.close()
        await self.broadcast_disconnect(client_id)
        del self.connected_clients[client_id]
        del self.player_list[client_id]
        self.print_ips()

    async def send_message(self, client_id: str, message: dict):
        """
        Send a message to one client. message should be a dict (JSON obj)
        """
        message_str = json.dumps(message)
        print("Sending message:", message_str)
        websocket = self.connected_clients[client_id]
        await websocket.send_text(message_str)

    async def broadcast_message(self, message: dict):
        """
        Send a message to all connected clients. message should be a dict (JSON obj)
        """
        message_str = json.dumps(message)
        print("Broadcasting message to everyone:", message_str)
        for websocket in self.connected_clients.values():
            await websocket.send_text(message_str)

    async def broadcast_player_data(self):
        message = {
            "type": "update_players",
            "player_data": self.player_list
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
            "player_move": self.handle_player_move,
            "chat_message": self.handle_chat_message,
        }
        handler = handlers.get(message["type"])
        if handler:
            await handler(client_id, message['data'])
        else:
            print(f"Unknown message type: {message['type']}")
    
    async def handle_new_main_player(self, client_id: str, message: Dict[str, any]):
        player = {
            'x': 500,
            'y': 500,
            'name': message['name']
        }
        self.player_list[client_id] = player
        out_message = {
            "type": "new_main_player",
            "client_id": client_id,
            "player": player
        }
        await self.send_message(client_id, out_message)
        # await self.broadcast_player_data()
    
    async def handle_player_move(self, client_id: str, message: Dict[str, any]):
        pass
    
    async def handle_chat_message(self, client_id: str, message: Dict[str, any]):
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
