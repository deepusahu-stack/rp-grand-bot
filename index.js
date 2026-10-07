const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  EmbedBuilder
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.DISCORD_TOKEN;

client.once("ready", async () => {
  console.log(`✅ ${client.user.tag} is online!`);

  const commands = [
    {
      name: "ping",
      description: "Check bot response"
    },
    {
      name: "help",
      description: "Show all bot commands"
    },
    {
      name: "serverinfo",
      description: "Show server information"
    },
    {
      name: "userinfo",
      description: "Show user information"
    },
    {
      name: "avatar",
      description: "Show a user's avatar"
    },
    {
      name: "say",
      description: "Send a message as the bot",
      options: [
        {
          name: "message",
          description: "Message to send",
          type: 3,
          required: true
        }
      ]
    }
  ];

  await client.application.commands.set(commands);
  console.log("✅ Slash commands registered!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;

  if (command === "ping") {
    return interaction.reply(`🏓 Pong! **${client.ws.ping}ms**`);
  }

  if (command === "help") {
    const embed = new EmbedBuilder()
      .setTitle("🤖 RP GRAND OFFICIAL BOT")
      .setDescription(
        "**Available Commands:**\n\n" +
        "🏓 `/ping` — Check bot response\n" +
        "📖 `/help` — Show commands\n" +
        "🏠 `/serverinfo` — Server information\n" +
        "👤 `/userinfo` — User information\n" +
        "🖼️ `/avatar` — Show avatar\n" +
        "💬 `/say` — Send a message"
      )
      .setFooter({ text: "RP GRAND OFFICIAL BOT" });

    return interaction.reply({ embeds: [embed] });
  }

  if (command === "serverinfo") {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setTitle("🏠 Server Information")
      .addFields(
        { name: "Server Name", value: guild.name, inline: true },
        { name: "Members", value: `${guild.memberCount}`, inline: true },
        { name: "Server ID", value: guild.id, inline: false }
      );

    return interaction.reply({ embeds: [embed] });
  }

  if (command === "userinfo") {
    const user = interaction.user;

    const embed = new EmbedBuilder()
      .setTitle("👤 User Information")
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "Username", value: user.tag, inline: true },
        { name: "User ID", value: user.id, inline: true }
      );

    return interaction.reply({ embeds: [embed] });
  }

  if (command === "avatar") {
    return interaction.reply({
      content: interaction.user.displayAvatarURL({
        extension: "png",
        size: 1024
      })
    });
  }

  if (command === "say") {
    if (
      !interaction.memberPermissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return interaction.reply({
        content: "❌ Only Server Administrators can use this command.",
        ephemeral: true
      });
    }

    const message = interaction.options.getString("message");

    return interaction.reply({
      content: message
    });
  }
});

if (!TOKEN) {
  console.error("❌ DISCORD_TOKEN is missing!");
  process.exit(1);
}

client.login(TOKEN);
