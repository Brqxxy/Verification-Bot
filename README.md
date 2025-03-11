# ✅ Verification Bot ✅
Verification Bot is a simple and efficient Discord bot that helps keep your server secure by ensuring users verify themselves before gaining access to channels and features. This bot is perfect for any server looking to reduce spam and improve security!
## 🚀 Features
* 🔒 **Automated Verification** – Users can verify themselves with a single button click
* 🏷 **Role Assignment** – Grants a specified "Verified" role upon successful verification
* 📜 **Custom Verification Embed** – Sends a clear and informative verification message
* ⚙️ **Admin-Only Setup** – The `!setupverify` command ensures only administrators can set up verification
## 🛠 Setup & Installation
### Prerequisites
Before installing, make sure you have:
* [Node.js](https://nodejs.org/) (v16 or later)
* [Discord Developer Portal](https://discord.com/developers/applications) Access to create a bot
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/Brqxxy/verification-bot.git
cd verification-bot
```
### 2️⃣ Install Dependencies
```sh
npm install
```
### 3️⃣ Set Up Your Bot Token
1. Create a bot on the Discord Developer Portal
2. Copy your **bot token**
3. Replace the `BOT_TOKEN` variable in `verify.js` with your bot token
### 4️⃣ Set Your Verified Role
1. Find the **Role ID** of the role you want to assign upon verification
2. Replace `VERIFIED_ROLE_ID` in `verify.js` with your desired role ID
### 5️⃣ Run the Bot
```sh
node verify.js
```
## 🐳 Docker Setup
Running Verification Bot in Docker provides an isolated, consistent environment that's easy to deploy across different systems.

### Prerequisites
* [Docker](https://www.docker.com/get-started) installed on your system

### 1️⃣ Create a Dockerfile
Create a file named `Dockerfile` in your project root:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

CMD ["node", "verify.js"]
```

### 2️⃣ Create a .dockerignore file
Create a `.dockerignore` file to exclude unnecessary files:

```
node_modules
npm-debug.log
.git
.gitignore
.env
README.md
```

### 3️⃣ Using Environment Variables
For better security, use environment variables instead of hardcoding sensitive information:

1. Create a `.env` file (this will NOT be included in the Docker image):
```
BOT_TOKEN=your_bot_token_here
VERIFIED_ROLE_ID=your_verified_role_id_here
```

2. Update your `verify.js` to use these environment variables:
```javascript
// Add this near the top of your file
require('dotenv').config();
const BOT_TOKEN = process.env.BOT_TOKEN;
const VERIFIED_ROLE_ID = process.env.VERIFIED_ROLE_ID;
```

3. Add `dotenv` to your dependencies:
```sh
npm install dotenv
```

### 4️⃣ Build and Run the Docker Container
```sh
# Build the Docker image
docker build -t verification-bot .

# Run the container with your environment variables
docker run -d --name verification-bot --restart unless-stopped --env-file .env verification-bot
```

### 5️⃣ Docker Compose (Optional)
For easier management, you can use Docker Compose. Create a `docker-compose.yml` file:

```yaml
version: '3'

services:
  bot:
    build: .
    restart: unless-stopped
    env_file: .env
```

Then run:
```sh
docker-compose up -d
```

### 🔄 Updating the Bot
When you make changes to your bot:

```sh
# If using Docker
docker stop verification-bot
docker rm verification-bot
docker build -t verification-bot .
docker run -d --name verification-bot --restart unless-stopped --env-file .env verification-bot

# If using Docker Compose
docker-compose down
docker-compose up -d --build
```

### 📋 Viewing Logs
```sh
# Docker
docker logs verification-bot

# Docker Compose
docker-compose logs
```
## 🔧 Commands
| Command | Description |
|---------|-------------|
| `!setupverify` | Sends the verification embed and button (Admin-only) |
## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a new Pull Request
## 🛠 Troubleshooting
* **Bot is not responding?** Check if it has the right permissions to send messages and manage roles
* **Bot is crashing?** Make sure your `BOT_TOKEN` and `VERIFIED_ROLE_ID` are set correctly
