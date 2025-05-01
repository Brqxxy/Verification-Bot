**🎉 Brqxxys Discord Verification Bot 🎉**
---
Welcome to Brqxxys Discord Verification Bot, your go-to bot for ensuring that only verified users can gain access to your Discord server! This bot helps maintain the integrity of your server by verifying that users are human and not bots. It uses a simple verification process based on account age and role management.

## 🚀 **Features**
- **🔐 Secure Verification**: New members are required to verify by clicking a button. Verification is only allowed for accounts that are at least **7 days old**.
- **✅ Automated Role Assignment**: Once verified, the bot automatically assigns a **verified role** to the user.
- **🕒 Cooldown**: Prevents spamming by enforcing a cooldown period between verification attempts.
- **🔧 Easy Setup**: Just use the `/setupverify` slash command to configure the verification system.
- **📚 Log Actions**: All actions (such as verification success or failure) are logged to a specific channel for easy tracking.
- **🚫 Blocked Roles**: Users with elevated roles (Admin, Moderator, Staff) are automatically excluded from verification, preventing abuse.
- **⚠️ Account Age Check**: Users must have an account that is at least 7 days old to be verified. This helps prevent bots from joining.
- **📱 Optional Phone Verification**: You can choose to enable Discord Phone verification for additional security.
- **🔄 Global Cooldown**: Limits spam and ensures the system is not overwhelmed by too many requests at once.
- **🔑 Role Hierarchy Check**: Ensures the bot's role is higher than the "verified" role, preventing permission issues.
- **🛑 Blacklisted Users**: Users can be blacklisted based on their User IDs. Any blacklisted users will be prevented from verifying on your server.
- **⏳ Kick Unverified Users**: Users who do not verify within a specified timeout period (10 minutes) will be automatically kicked from the server, preventing unverified users from lingering.

---

## 🛠 **Setup & Installation**

### **Prerequisites**
Before installing, make sure you have:
* [Node.js](https://nodejs.org/) (v16 or later)
* [Discord Developer Portal](https://discord.com/developers/applications) Access to create a bot

### **1️⃣ Clone the Repository**
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
2. Copy your **bot token** and **application ID**
3. Create a **.env** file (this will NOT be included)
4. Add your bot token and application ID to the `.env` file:
```
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
VERIFIED_ROLE_ID=your_verified_role_id_here
LOG_CHANNEL_ID=your_log_channel_id_here
```

### 4️⃣ Set Your Verified Role
1. Find the Role ID of the role you want to assign upon verification
2. Replace `VERIFIED_ROLE_ID` in `.env` with your desired role ID
3. Replace `LOG_CHANNEL_ID` in `.env` with your desired channel ID (Optional).

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
CLIENT_ID=your_application_id_here
VERIFIED_ROLE_ID=your_verified_role_id_here
LOG_CHANNEL_ID=your_log_channel_id_here
```

2. Update your `verify.js` to use these environment variables:
```javascript
require('dotenv').config();
const BOT_TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const VERIFIED_ROLE_ID = process.env.VERIFIED_ROLE_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
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
| `/setupverify` | Sends the verification embed and button (Admin-only) |

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a new Pull Request

## 📱 Phone Verification
The bot has an optional Discord Phone verification feature that adds an extra layer of security:

1. **Enable in Discord Server**: Turn on Phone verification in your Discord server settings
2. **Configuration in Code**: 
   - By default, the feature is enabled
   - To disable it, find and comment out or remove lines 189-191 in the code:
   ```javascript
   // Comment out these lines to disable phone verification
   if (!member.user.phoneVerified) {
     return interaction.reply({ content: "You need to verify your phone number with Discord to use this server!", ephemeral: true });
   }
   ```

## 🛠 Troubleshooting
* **Bot is not responding?** Check if it has the right permissions to send messages and manage roles
* **Bot is crashing?** Make sure your `BOT_TOKEN`, `CLIENT_ID`, and `VERIFIED_ROLE_ID` are set correctly
* **These role names must match exactly!:** `const blockedRoles = ['Admin', 'Moderator', 'Staff'];` If your roles are named differently, just change those
