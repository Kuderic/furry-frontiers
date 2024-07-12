# Server

There are two ways to run the server. One is in local testing mode, and the other is opening a server to the internet.

For online mode, the server is developed to be hosted on an AWS EC2 virtual machine running Amazon Linux 2, but you can probably host it on your own machine, too.

## Online Server Hosting

You can either use Docker or simply run uvicorn locally.

1. Running in a Docker container:

Build docker container

```
docker build -t furry-frontiers .
```

Then use this command

```bash
./run_server.sh
```

2. Running without docker:

First install all python dependencies.

```bash
pip install -r requirements.txt
```

Then run the server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```


## Local Server Testing

Run in the terminal `python server.py`, and then go to `localhost:8000` in a browser.