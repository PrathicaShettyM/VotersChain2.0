## Backend Installation
- npm init -y
- npm install express mongoose dotenv bcryptjs jsonwebtoken cors nodemon

- nodemon server.js

# Frontend Installation
- npm create vite@latest . --template react
- npm install axios react-router-dom
- npm install tailwindcss @tailwindcss/vite

- npm run dev

# Blockchain

- npx hardhat compile
- npx hardhat node
- npx hardhat run scripts/deploy.js --network localhost