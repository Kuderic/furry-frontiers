## Client

You will need to use npm to install the client-side dependencies. from this folder run
```
npm install
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

And then start nodemon using

```
    npm run watch
```

Then, whenever a file in src is changed, parcel will automatically rebuild the static files for the server.