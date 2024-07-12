from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
import os

app = FastAPI()


server_directory = os.path.dirname(os.path.abspath(__file__))
print(f"Current working directory: {server_directory}")
static_directory = os.path.join(server_directory, "static")
if not os.path.exists(static_directory):
    raise RuntimeError(f"Directory '{static_directory}' does not exist")

app.mount("/", StaticFiles(directory=static_directory, html=True), name="static")

@app.get("/")
async def get_index():
    index_path = os.path.join(static_directory, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        return {"error": "index.html not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
