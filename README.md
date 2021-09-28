# DataCube

## Usage


remove unused lib
tune dynamic loader
clear script id


## Development

### Getting started

Enable [API Google Apps Script](https://script.google.com/home/usersettings) on your Google account.

```
yarn clasp login
yarn clasp create --type sheets --title DataCube
yarn clasp open
```

Setup https for local development & react hot-reload.

```
brew install mkcert
mkcert -install
mkdirp -p certs
mkcert -key-file ./certs/key.pem -cert-file ./certs/cert.pem localhost 127.0.0.1
```

And it should be ready to access on your newly created sheet (you may need to reload the sheet) and the BigQuery button should appear on the top bar.

```
yarn start
yarn lint
```

### Deploy

```
yarn clasp setting rootDir dist
npm run deploy
```

##

Based on https://github.com/enuchi/React-Google-Apps-Script.
