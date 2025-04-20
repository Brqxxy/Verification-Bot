const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  PermissionsBitField,
  AuditLogEvent,
  ActivityType // ✅ Included this for presence status
} = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const VERIFIED_ROLE_ID = process.env.VERIFIED_ROLE_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const COMMAND = '!setupverify';
const VERIFICATION_COOLDOWN = 60000;
const MIN_ACCOUNT_AGE = 24 * 60 * 60 * 1000;

const verificationAttempts = new Map();
const verifiedUsers = new Map();

const DATA_FILE = path.join(__dirname, 'verified-users.json');
try {
  if (fs.existsSync(DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    for (const [id, timestamp] of Object.entries(data)) {
      verifiedUsers.set(id, timestamp);
    }
    console.log(`Loaded ${verifiedUsers.size} verified users from file`);
  }
} catch (err) {
  console.error('Error loading verified users file:', err);
}

function saveVerifiedUsers() {
  const data = Object.fromEntries(verifiedUsers);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

async function logAction(guild, message, color = "#1AAD91") {
  if (!LOG_CHANNEL_ID) return;
  
  const logChannel = guild.channels.cache.get(LOG_CHANNEL_ID);
  if (!logChannel) return;
  
  const logEmbed = new EmbedBuilder()
    .setColor(color)
    .setTitle("Verification System Log")
    .setDescription(message)
    .setTimestamp();
  
  await logChannel.send({ embeds: [logEmbed] }).catch(console.error);
}

client.once('ready', () => {
  console.log(`Bot is online! Logged in as ${client.user.tag}`);

  // ✅ Set bot status here
  client.user.setPresence({
    activities: [{
      name: 'Brqx Snowboard',
      type: ActivityType.Watching
    }],
    status: 'online'
  });
});

function checkBotPermissions(guild) {
  const me = guild.members.cache.get(client.user.id);
  
  if (!me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
    return "I don't have permission to manage roles";
  }
  
  const role = guild.roles.cache.get(VERIFIED_ROLE_ID);
  if (!role) {
    return "The verification role doesn't exist";
  }
  
  if (me.roles.highest.position <= role.position) {
    return "My role is not higher than the verified role in the hierarchy";
  }
  
  return null;
}

let globalCooldownActive = false;

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(COMMAND)) return;
  if (!message.guild) return;
  
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return message.reply('You need administrator permissions to use this command.');
  }
  
  const permissionIssue = checkBotPermissions(message.guild);
  if (permissionIssue) {
    return message.reply(`⚠️ ${permissionIssue}. Please fix this before setting up verification.`);
  }

  const serverName = message.guild.name;
  const serverIcon = message.guild.iconURL() || 'https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico';
  
  const verifyEmbed = new EmbedBuilder()
    .setAuthor({ name: `${serverName} Verification`, iconURL: serverIcon })
    .setColor("#1AAD91")
    .addFields(
      { name: '**:white_small_square:Welcome!ㅤ**', value: `> **\`⭕ Hello and welcome to ${serverName}! To gain access, you must complete a simple verification to prove you’re not a bot. 🛠️\`**`, inline: false },
      { name: '**:white_small_square:How do you Verify?**', value: '> **\`⭕ Your account must be at least 24 hours old. Click the button below to complete verification. 🚀\`**', inline: false },
      { name: '**:white_small_square:Verification complete!**', value: `> **\`✅ Once verified, you’ll gain access to the server. Thanks for joining ${serverName}! 📚\`**`, inline: false },
    );

  const buttons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('verify')
        .setLabel('Verify')
        .setStyle(ButtonStyle.Success)
    );

  try {
    const messages = await message.channel.messages.fetch({ limit: 50 });
    const botMessages = messages.filter(msg => 
      msg.author.id === client.user.id && 
      msg.embeds.length > 0 && 
      msg.embeds[0].author?.name?.includes('Verification')
    );
    
    if (botMessages.size > 0) {
      await message.channel.bulkDelete(botMessages).catch(console.error);
    }
    
    const sentMessage = await message.channel.send({
      embeds: [verifyEmbed],
      components: [buttons]
    });
    
    await logAction(message.guild, `Verification system was set up by ${message.author.tag} (${message.author.id}) in channel #${message.channel.name}`, "#00ff00");
    
    await message.delete().catch(err => {
      console.error('Failed to delete command message:', err);
    });
    
    return sentMessage;
  } catch (error) {
    console.error('Error setting up verification:', error);
    return message.reply('There was an error setting up the verification system. Please check my permissions and try again.');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton() || interaction.customId !== 'verify') return;

  const { user, guild, member } = interaction;

  try {
    const blockedRoles = ['Admin', 'Moderator', 'Staff'];
    if (member.roles.cache.some(role => blockedRoles.includes(role.name))) {
      return interaction.reply({
        content: '⚠️ You already have elevated access — verification is not required.',
        ephemeral: true
      });
    }

    if (member.roles.cache.has(VERIFIED_ROLE_ID)) {
      return interaction.reply({
        content: '✅ You are already verified!',
        ephemeral: true
      });
    }

    if (globalCooldownActive) {
      return interaction.reply({
        content: '🕒 Please wait a few seconds before trying again. The verification system is cooling down globally.',
        ephemeral: true
      });
    }

    const now = Date.now();
    const lastAttempt = verificationAttempts.get(user.id) || 0;
    if (now - lastAttempt < VERIFICATION_COOLDOWN) {
      const timeLeft = Math.ceil((VERIFICATION_COOLDOWN - (now - lastAttempt)) / 1000);
      return interaction.reply({
        content: `⏱️ Please wait ${timeLeft} seconds before trying to verify again.`,
        ephemeral: true
      });
    }

    globalCooldownActive = true;
    setTimeout(() => {
      globalCooldownActive = false;
    }, 5000);

    verificationAttempts.set(user.id, now);

    const accountAge = now - user.createdTimestamp;
    if (accountAge < MIN_ACCOUNT_AGE) {
      const hoursLeft = Math.ceil((MIN_ACCOUNT_AGE - accountAge) / (1000 * 60 * 60));
      return interaction.reply({
        content: `❌ Your account is too new. Please wait approximately ${hoursLeft} more hours before trying again.`,
        ephemeral: true
      });
    }

    const permissionIssue = checkBotPermissions(guild);
    if (permissionIssue) {
      await logAction(guild, `Failed to verify ${user.tag} (${user.id}): ${permissionIssue}`, "#ff0000");
      return interaction.reply({
        content: `❌ Verification failed due to a system error: ${permissionIssue}. Please contact an administrator.`,
        ephemeral: true
      });
    }

    await member.roles.add(VERIFIED_ROLE_ID);
    verifiedUsers.set(user.id, now);
    saveVerifiedUsers();

    await logAction(guild, `User ${user.tag} (${user.id}) was successfully verified`, "#00ff00");

    return interaction.reply({
      content: `✅ You have been successfully verified! Welcome to ${guild.name}.`,
      ephemeral: true
    });
  } catch (error) {
    console.error('Error during verification:', error);
    await logAction(guild, `Error verifying ${user.tag} (${user.id}): ${error.message}`, "#ff0000");

    return interaction.reply({
      content: '❌ There was an error while verifying you. Please contact an administrator.',
      ephemeral: true
    });
  }
});

client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

client.login(BOT_TOKEN).catch(error => {
  console.error('Failed to login:', error);
  process.exit(1);
});
