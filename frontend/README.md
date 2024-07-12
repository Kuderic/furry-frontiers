## Client

You will need to use npm to install the client-side dependencies. from this folder run
```
npm i parcel
npm i phaser
```

And then to build the client you run
```
npm run build
```

This will build a compact version of the client and put it in the `..backend/static` directory. This client code will be delivered to the client when they make an http request to the server.



## Auto-build

If you are changing client files and want them to automatically rebuild, you can use Nodemon

```
npm install --save-dev nodemon
```

Then add this to package.json:

```
    "watch": "nodemon --watch src --watch static --exec \"npm run build\""
```

And then start nodemon using

```
    npm run watch
```