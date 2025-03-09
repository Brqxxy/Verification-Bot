const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

// ===== CONFIGURATION =====
const BOT_TOKEN = 'BOT_TOKEN';
const VERIFIED_ROLE_ID = 'VERIFIED_ROLE_ID';
const COMMAND = '!setupverify';
// ========================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Bot is online! Logged in as ${client.user.tag}`);
});

// Command to create the verification embed
client.on('messageCreate', async (message) => {
  if (message.content.startsWith(COMMAND)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('You need administrator permissions to use this command.');
    }
    
    const roleId = VERIFIED_ROLE_ID;
    const role = message.guild.roles.cache.get(roleId);
    if (!role) {
      return message.reply('The verification role does not exist.');
    }

    // Create the embed for the verification
    const verifyEmbed = new EmbedBuilder()
      .setAuthor({ name: 'Server_Name Verification', iconURL: 'IMG_URL_HERE', url: 'https://discord.js.org' })
      .setColor("#ff5e00")
      .addFields(
        { name: '**:white_small_square:Welcome!ㅤ**', value: '> **`⭕ Hello welcome to the Server_Name Discord! As this is your first time joining the Server_Name Discord you will need to conduct a verification to assure that you are not a robot. 🛠️`**', inline: false },
        { name: '**:white_small_square:How do you Verify?**', value: '> **`⭕ In order to verify yourself you are required to have the email linked to your discord verified, once the following has been completed you must select the reaction below to complete the verification! 🚀`**', inline: false },
        { name: '**:white_small_square:Verification complete!**', value: '> **`✅ Once following the steps above have been completed you have now been successfully verified! We hope you enjoy your stay here at Server_Name & remember to follow all Community Rules. 📚`**', inline: false },
      );

    // Create the buttons for verification
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('verify')
          .setLabel('Verify')
          .setStyle(ButtonStyle.Success)
      );

    // Check if the embed has already been sent to avoid duplication
    const messages = await message.channel.messages.fetch({ limit: 10 });
    const previousEmbed = messages.some(msg => msg.embeds.length > 0 && msg.embeds[0].author?.name === 'Server_Name Verification');
    if (!previousEmbed) {
      // Send the verification embed and button only if no previous embed was sent
      await message.channel.send({
        embeds: [verifyEmbed],
        components: [buttons],
        allowedMentions: { repliedUser: false }
      });

      // Optionally delete the command message to keep the channel clean
      await message.delete().catch(console.error);
    }
  }
});

// Handle button interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId === 'verify') {
    try {
      await interaction.member.roles.add(VERIFIED_ROLE_ID);
      await interaction.reply({
        content: '✅ You have been successfully verified! Welcome to Server_Name.',
        ephemeral: true
      });
    } catch (error) {
      console.error('Error giving role:', error);
      await interaction.reply({
        content: '❌ There was an error while verifying you. Please contact an administrator.',
        ephemeral: true
      });
    }
  }
});

client.login(BOT_TOKEN);

// Made by Brqx, Enjoy!🚀
