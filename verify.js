const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ActivityType,
  MessageFlags,
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const VERIFIED_ROLE_ID = process.env.VERIFIED_ROLE_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const VERIFICATION_COOLDOWN = 60000;
const MIN_ACCOUNT_AGE = 7 * 24 * 60 * 60 * 1000;
const UNVERIFIED_KICK_DELAY = 10 * 60 * 1000;

const blacklistedIDs = [
  "123456789012345678",
  "987654321098765432"
];

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


const commands = [
  new SlashCommandBuilder()
    .setName('setupverify')
    .setDescription('Setup the verification system in the current channel')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
];


const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

async function registerCommands() {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

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

  client.user.setPresence({
    activities: [{
      name: 'Brqx Snowboard',
      type: ActivityType.Watching
    }],
    status: 'online'
  });


  registerCommands();
});

client.on('guildMemberAdd', member => {
  if (member.user.bot || member.roles.cache.has(VERIFIED_ROLE_ID)) return;

  setTimeout(async () => {
    try {
      const refreshed = await member.guild.members.fetch(member.id);
      if (!refreshed.roles.cache.has(VERIFIED_ROLE_ID)) {
        await refreshed.kick("Did not verify within time limit");
        await logAction(member.guild, `⏳ ${refreshed.user.tag} (${refreshed.id}) was kicked for not verifying in time.`, "#FFA500");
      }
    } catch (err) {
      console.error(`Kick check failed for ${member.user.tag}:`, err);
    }
  }, UNVERIFIED_KICK_DELAY);
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


client.on('interactionCreate', async (interaction) => {

  if (interaction.isChatInputCommand() && interaction.commandName === 'setupverify') {
    const { guild, channel, member } = interaction;

    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: 'You need administrator permissions to use this command.',
        flags: MessageFlags.Ephemeral
      });
    }

    const permissionIssue = checkBotPermissions(guild);
    if (permissionIssue) {
      return interaction.reply({
        content: `⚠️ ${permissionIssue}. Please fix this before setting up verification.`,
        flags: MessageFlags.Ephemeral
      });
    }

    const serverName = guild.name;
    const serverIcon = guild.iconURL() || 'https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico';

    const verifyEmbed = new EmbedBuilder()
    .setAuthor({ name: `${serverName} Verification`, iconURL: serverIcon })
    .setColor("#1AAD91")
    .addFields(
      { 
        name: '**:white_small_square: Welcome!**', 
        value: `\`⭕ Hello and welcome to ${serverName}! To gain access, you must complete a simple verification to prove you're not a bot. 🛠️\``, 
        inline: false 
      },
      { 
        name: '**:white_small_square: Phone Verification Required!**', 
        value: `\`📱 Your Discord account must have a verified phone number. This helps us prevent spam and maintain server security.\``, 
        inline: false 
      },
      { 
        name: '**:white_small_square: How do you Verify?**', 
        value: `\`⭕ Your account must be at least 7 days old. Click the button below to complete verification. 🚀\``, 
        inline: false 
      },
      { 
        name: '**:white_small_square: Verification Complete!**', 
        value: `\`✅ Once verified, you'll gain access to the server. Thanks for joining ${serverName}! 📚\``, 
        inline: false 
      }
    );  

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('verify')
          .setLabel('Verify')
          .setStyle(ButtonStyle.Success)
      );

    try {
      const messages = await channel.messages.fetch({ limit: 50 });
      const botMessages = messages.filter(msg =>
        msg.author.id === client.user.id &&
        msg.embeds.length > 0 &&
        msg.embeds[0].author?.name?.includes('Verification')
      );

      if (botMessages.size > 0) {
        await channel.bulkDelete(botMessages).catch(console.error);
      }

      const sentMessage = await channel.send({
        embeds: [verifyEmbed],
        components: [buttons]
      });

      await logAction(guild, `Verification system was set up by ${interaction.user.tag} (${interaction.user.id}) in channel #${channel.name}`, "#00ff00");

      return interaction.reply({
        content: 'Verification system has been successfully set up!',
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error('Error setting up verification:', error);
      return interaction.reply({
        content: 'There was an error setting up the verification system. Please check my permissions and try again.',
        flags: MessageFlags.Ephemeral
      });
    }
  }

 
  if (interaction.isButton() && interaction.customId === 'verify') {
    const { user, guild, member, channel } = interaction;

    try {
      const blockedRoles = ['Admin', 'Moderator', 'Staff'];
      if (member.roles.cache.some(role => blockedRoles.includes(role.name))) {
        return interaction.reply({
          content: '⚠️ You already have elevated access — verification is not required.',
          flags: MessageFlags.Ephemeral
        });
      }

      if (member.roles.cache.has(VERIFIED_ROLE_ID)) {
        return interaction.reply({
          content: '✅ You are already verified!',
          flags: MessageFlags.Ephemeral
        });
      }

      if (globalCooldownActive) {
        return interaction.reply({
          content: '🕒 Please wait a few seconds before trying again. The verification system is cooling down globally.',
          flags: MessageFlags.Ephemeral
        });
      }

      const now = Date.now();
      const lastAttempt = verificationAttempts.get(user.id) || 0;
      if (now - lastAttempt < VERIFICATION_COOLDOWN) {
        const timeLeft = Math.ceil((VERIFICATION_COOLDOWN - (now - lastAttempt)) / 1000);
        return interaction.reply({
          content: `⏱️ Please wait ${timeLeft} seconds before trying again.`,
          flags: MessageFlags.Ephemeral
        });
      }

      globalCooldownActive = true;
      setTimeout(() => {
        globalCooldownActive = false;
      }, 5000);

      verificationAttempts.set(user.id, now);

      if (blacklistedIDs.includes(user.id)) {
        await logAction(guild, `❌ Blocked blacklisted user ${user.tag} (${user.id}) from verifying.`, "#ff0000");
        return interaction.reply({
          content: '🚫 You are blacklisted from verifying on this server.',
          flags: MessageFlags.Ephemeral
        });
      }

      const accountAge = now - user.createdTimestamp;
      if (accountAge < MIN_ACCOUNT_AGE) {
        const msLeft = MIN_ACCOUNT_AGE - accountAge;
        const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.ceil((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return interaction.reply({
          content: `❌ Your account is too new. Please wait approximately ${daysLeft} day(s) and ${hoursLeft} hour(s) before trying again.`,
          flags: MessageFlags.Ephemeral
        });
      }

      const permissionIssue = checkBotPermissions(guild);
      if (permissionIssue) {
        await logAction(guild, `Failed to verify ${user.tag} (${user.id}): ${permissionIssue}`, "#ff0000");
        return interaction.reply({
          content: `❌ Verification failed due to a system error: ${permissionIssue}. Please contact an administrator.`,
          flags: MessageFlags.Ephemeral
        });
      }

      
      await interaction.deferReply({ ephemeral: true });

      await member.roles.add(VERIFIED_ROLE_ID);
      verifiedUsers.set(user.id, now);
      saveVerifiedUsers();

      await logAction(guild, `User ${user.tag} (${user.id}) was successfully verified`, "#00ff00");

      return interaction.followUp({
        content: `✅ You have been successfully verified! Welcome to ${guild.name}.`,
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error('Error during verification:', error);
      await logAction(guild, `Error verifying ${user.tag} (${user.id}): ${error.message}`, "#ff0000");

      
      if (interaction.deferred) {
        return interaction.followUp({
          content: '❌ There was an error while verifying you. Please contact an administrator.',
          flags: MessageFlags.Ephemeral
        });
      } else {
        return interaction.reply({
          content: '❌ There was an error while verifying you. Please contact an administrator.',
          flags: MessageFlags.Ephemeral
        });
      }
    }
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

//Made by Brqx, enjoy! 🚀
