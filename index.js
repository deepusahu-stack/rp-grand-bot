
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder,
  ApplicationCommandOptionType
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.DISCORD_TOKEN;
const ADMIN = PermissionsBitField.Flags.Administrator;

const commands = [
  { name: "ping", description: "Check bot response" },
  { name: "help", description: "Show all bot commands" },
  { name: "serverinfo", description: "Show server information" },
  {
    name: "userinfo",
    description: "Show user information",
    options: [{
      name: "user",
      description: "Select a user",
      type: ApplicationCommandOptionType.User
    }]
  },
  {
    name: "avatar",
    description: "Show a user's avatar",
    options: [{
      name: "user",
      description: "Select a user",
      type: ApplicationCommandOptionType.User
    }]
  },
  {
    name: "say",
    description: "Send a message as the bot",
    options: [{
      name: "message",
      description: "Message to send",
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  },
  {
    name: "poll",
    description: "Create a yes/no poll",
    options: [{
      name: "question",
      description: "Your poll question",
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  },
  {
    name: "announce",
    description: "Post a server announcement",
    options: [{
      name: "message",
      description: "Announcement text",
      type: ApplicationCommandOptionType.String,
      required: true
    }]
  },
  {
    name: "slowmode",
    description: "Set channel slowmode",
    options: [{
      name: "seconds",
      description: "Delay from 0 to 21600 seconds",
      type: ApplicationCommandOptionType.Integer,
      required: true,
      min_value: 0,
      max_value: 21600
    }]
  },
  { name: "lock", description: "Lock the current text channel" },
  { name: "unlock", description: "Unlock the current text channel" }
];

client.once("ready", async () => {
  console.log(`Online: ${client.user.tag}`);

  try {
    await client.application.commands.set(commands);
    console.log("11 slash commands registered!");
  } catch (error) {
    console.error("Command registration failed:", error);
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;
  const admin = interaction.memberPermissions?.has(ADMIN);

  try {
    if (command === "ping") {
      return interaction.reply(`🏓 Pong! ${client.ws.ping}ms`);
    }

    if (command === "help") {
      const embed = new EmbedBuilder()
        .setTitle("RP GRAND OFFICIAL BOT")
        .setDescription(
          "**General Commands**\n" +
          "`/ping` `/help` `/serverinfo` `/userinfo` `/avatar`\n\n" +
          "**Utility Commands**\n" +
          "`/say` `/poll` `/announce`\n\n" +
          "**Moderation Commands**\n" +
          "`/slowmode` `/lock` `/unlock`"
        )
        .setColor(0xD4AF37);

      return interaction.reply({ embeds: [embed] });
    }

    if (command === "serverinfo") {
      const guild = interaction.guild;
      if (!guild) {
        return interaction.reply({
          content: "Use this command in a server.",
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("🏠 Server Information")
        .addFields(
          { name: "Name", value: guild.name },
          { name: "Members", value: String(guild.memberCount) },
          { name: "Server ID", value: guild.id }
        )
        .setColor(0xD4AF37);

      return interaction.reply({ embeds: [embed] });
    }

    if (command === "userinfo") {
      const user =
        interaction.options.getUser("user") || interaction.user;

      const embed = new EmbedBuilder()
        .setTitle("👤 User Information")
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: "Username", value: user.tag },
          { name: "User ID", value: user.id }
        )
        .setColor(0xD4AF37);

      return interaction.reply({ embeds: [embed] });
    }

    if (command === "avatar") {
      const user =
        interaction.options.getUser("user") || interaction.user;

      return interaction.reply({
        content: user.displayAvatarURL({ size: 1024 })
      });
    }

    if (command === "say") {
      if (!admin) {
        return interaction.reply({
          content: "❌ Administrators only.",
          ephemeral: true
        });
      }

      return interaction.reply({
        content: interaction.options.getString("message")
      });
    }

    if (command === "poll") {
      const question = interaction.options.getString("question");
      const message = await interaction.reply({
        content: `📊 **POLL**\n${question}\n\n👍 Yes | 👎 No`,
        fetchReply: true
      });

      await message.react("👍");
      await message.react("👎");
      return;
    }

    if (command === "announce") {
      if (!admin) {
        return interaction.reply({
          content: "❌ Administrators only.",
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("📢 Server Announcement")
        .setDescription(interaction.options.getString("message"))
        .setColor(0xD4AF37)
        .setFooter({ text: "RP GRAND OFFICIAL BOT" });

      return interaction.reply({ embeds: [embed] });
    }

    if (command === "slowmode") {
      if (!admin) {
        return interaction.reply({
          content: "❌ Administrators only.",
          ephemeral: true
        });
      }

      if (!interaction.channel?.setRateLimitPerUser) {
        return interaction.reply({
          content: "This channel does not support slowmode.",
          ephemeral: true
        });
      }

      const seconds = interaction.options.getInteger("seconds");
      await interaction.channel.setRateLimitPerUser(seconds);

      return interaction.reply(
        `✅ Slowmode set to ${seconds} seconds.`
      );
    }

    if (command === "lock" || command === "unlock") {
      if (!admin) {
        return interaction.reply({
          content: "❌ Administrators only.",
          ephemeral: true
        });
      }

      const channel = interaction.channel;
      if (!channel?.permissionOverwrites) {
        return interaction.reply({
          content: "This channel cannot be locked.",
          ephemeral: true
        });
      }

      await channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        {
          SendMessages: command === "unlock"
        }
      );

      return interaction.reply(
        command === "lock"
          ? "🔒 Channel locked."
          : "🔓 Channel unlocked."
      );
    }
  } catch (error) {
    console.error(`/${command} failed:`, error);

    const response = {
      content: "❌ Command failed. Check the bot console.",
      ephemeral: true
    };

    if (interaction.replied || interaction.deferred) {
      return interaction.followUp(response).catch(() => {});
    }

    return interaction.reply(response).catch(() => {});
  }
});

if (!TOKEN) {
  console.error("DISCORD_TOKEN is missing!");
  process.exit(1);
}

client.login(TOKEN).catch(error => {
  console.error("Bot login failed:", error);
});
      
