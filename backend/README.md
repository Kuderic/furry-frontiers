# Server

There are two ways to run the server. One is in local testing mode, and the other is opening a server to the internet.

For online mode, the server is developed to be hosted on an AWS EC2 virtual machine running Amazon Linux 2, but you can probably host it on your own machine, too.

## Online Server Hosting

1. Build a Docker container:

```
docker build -t furry-frontiers .
```

2. Install the local python dependencies.

```bash
pip install -r requirements.txt
```

3. Start nginx

```bash
sudo systemctl restart nginx
```

You will have to mess around with your nginx config to make sure it works with your DNS properly.
The config can usually be found at `sudo nano /etc/nginx/nginx.conf`. I recommend adding 
`include /etc/nginx/mime.types;` to your config file.

4. Run the server

```bash
./run_server.sh
```


## Local Server Testing

Run in the terminal `python server.py`, and then go to `localhost:8000` in a browser.