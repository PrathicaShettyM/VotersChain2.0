## Blockchain
Terminal 1
- cd client
- npx hardhat node

Terminal 2
- cd client
- npx hardhat compile
- npx hardhat run scripts/deploy.js --network localhost

- u get a deployed address -> paste in .env in frontend
```
VITE_CONTRACT_ADDRESS=ur deployed address
```

## Backend Installation
Terminal 3: 
- cd server
- npm install
- create a .env and add all these
```
PORT=

MONGO_URI=local or cloud URL

JWT_SECRET=ur jwt secret

ADMIN_EMAIL=admin email => let it be imaginary
ADMIN_PASSWORD=admin password => let it be imaginary

EMAIL_ID=give ur real gmail
EMAIL_PASS=go to google app passwords n take a new passowrd
```

- nodemon server.js


## Frontend Installation
Terminal 4
- cd client
- npm install
- (hardhat(if need needed reinitalise))
- npm run dev

- first time users/voters import ur eth account to metamask using import account option inm metamask entering ur private key
