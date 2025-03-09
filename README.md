# ✅ Verification Bot ✅

Verification Bot is a simple and efficient Discord bot that helps keep your server secure by ensuring users verify themselves before gaining access to channels and features. This bot is perfect for any server looking to reduce spam and improve security!

## 🚀 Features

* 🔒 **Automated Verification** – Users can verify themselves with a single button click
* 🏷 **Role Assignment** – Grants a specified "Verified" role upon successful verification
* 📜 **Custom Verification Embed** – Sends a clear and informative verification message
* ⚙️ **Admin-Only Setup** – The `!setupverify` command ensures only administrators can set up verification
* 🛑 **Prevents Duplicate Messages** – The bot checks for existing verification messages to keep channels clean

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
