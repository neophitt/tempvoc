# 🎙️ TempVoc

> A Discord bot to manage temporary voice channels — automatically created when a user joins a defined channel, and deleted when empty.

[![Version](https://img.shields.io/badge/version-1.1.0-blue)](https://github.com/neophitt/tempvoc)
[![License](https://img.shields.io/badge/license-BSL--1.0-green)](./LICENSE)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2)](https://discord.js.org)
[![Node.js](https://img.shields.io/badge/node.js-18%2B-brightgreen)](https://nodejs.org)

---

## 📋 Table of Contents

- [🎙️ TempVoc](#️-tempvoc)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [📦 Requirements](#-requirements)
  - [🚀 Installation](#-installation)
  - [⚙️ Configuration](#️-configuration)
    - [Required Bot Permissions](#required-bot-permissions)
    - [Required Gateway Intents](#required-gateway-intents)
  - [🗄️ Database Setup](#️-database-setup)
  - [💬 Commands](#-commands)
    - [⚙️ Administration](#️-administration)
    - [🎙️ Voice Channel Management](#️-voice-channel-management)
    - [📊 General](#-general)
  - [📁 Project Structure](#-project-structure)
  - [🆘 Support](#-support)
  - [📄 License](#-license)

---

## ✨ Features

- 🎙️ **Automatic temporary voice channels** — Created when a user joins the configured trigger channel, deleted when empty
- 🔒 **Full channel management** — Lock, unlock, limit, kick, ban, unban, invite, transfer ownership
- 🔑 **Ownership claim** — Recover ownership if the original owner leaves
- 🛡️ **Robust cleanup** — Orphan channels are cleaned up on bot startup and when the bot leaves a guild
- 📊 **Stats command** — View servers, active channels, and latency
- ⚙️ **Per-guild configuration** — Each server defines its own trigger channel and category

---

## 📦 Requirements

- [Node.js](https://nodejs.org) v18 or higher
- A MySQL database
- A Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))

---

## 🚀 Installation

**1. Clone the repository**
```bash
git clone https://github.com/neophitt/tempvoc.git
cd tempvoc
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**
```bash
cp .env.example .env
```

Fill in the `.env` file (see [Configuration](#-configuration)).

**4. Set up the database**

Run the SQL queries from the [Database Setup](#-database-setup) section.

**5. Start the bot**
```bash
node main.js
```

---

## ⚙️ Configuration

Copy `.env.example` to `.env` and fill in the values:

```env
# ——→ Bot informations:
BOT_TOKEN=        # Your bot token
BOT_ID=           # Your bot application ID
SERVER_ID=        # Your test guild ID (for guild-scoped command deployment)

# ——→ Database informations:
DB_HOST=          # Database host (e.g. localhost)
DB_USER=          # Database user
DB_PASS=          # Database password
DB_PORT=          # Database port (default: 3306)
DB_NAME=          # Database name
```

### Required Bot Permissions

Make sure your bot has the following permissions in your server:

| Permission | Reason |
|---|---|
| `Manage Channels` | Create and delete temporary voice channels |
| `Move Members` | Move users to their created channel |
| `Mute Members` | Allow channel owners to mute members |
| `Deafen Members` | Allow channel owners to deafen members |
| `View Channels` | Read channel information |
| `Send Messages` | Send the welcome embed in voice channels |

### Required Gateway Intents

The following intents must be enabled in the [Discord Developer Portal](https://discord.com/developers/applications) under your bot's settings:

- `SERVER MEMBERS INTENT`
- `MESSAGE CONTENT INTENT`

---

## 🗄️ Database Setup

Run the following SQL queries to create the required tables:

```sql
CREATE TABLE servers (
    server_id   VARCHAR(20) NOT NULL,
    owner_id    VARCHAR(20) NOT NULL,
    added_at    INT         NOT NULL,
    channel_id  VARCHAR(20) NOT NULL,
    category_id VARCHAR(20) NOT NULL,
    PRIMARY KEY (server_id)
);

CREATE TABLE temp_channels (
    channel_id  VARCHAR(20) NOT NULL PRIMARY KEY,
    server_id   VARCHAR(20) NOT NULL,
    owner_id    VARCHAR(20) NOT NULL,
    created_at  INT         NOT NULL
);
```

---

## 💬 Commands

### ⚙️ Administration
> Requires the `Administrator` permission.

| Command | Description |
|---|---|
| `/setup` | Configure the bot for your server (trigger channel + category) |
| `/reset` | Reset the bot configuration and delete all active temporary channels |
| `/add` | Invite the bot to your server |

### 🎙️ Voice Channel Management
> Must be used by the owner of a temporary voice channel.

| Command | Description |
|---|---|
| `/lock` | Lock the channel — prevent new users from joining |
| `/unlock` | Unlock the channel |
| `/limit <number>` | Set a user limit (0 = unlimited, max 99) |
| `/kick <user>` | Kick a user from the channel |
| `/ban <user>` | Ban a user from the channel (disconnect + block access) |
| `/unban <user>` | Unban a user from the channel |
| `/invite <user>` | Invite a user to the channel (useful when locked) |
| `/transfer <user>` | Transfer channel ownership to another member |
| `/claim` | Claim ownership of the channel if the owner has left |

### 📊 General

| Command | Description |
|---|---|
| `/stats` | Display bot statistics (servers, active channels, latency) |
| `/ping` | Check the bot's response time |

---

## 📁 Project Structure

```
tempvoc/
├── Commands/
│   ├── moderation/
│   │   ├── setup.js          # Server configuration
│   │   └── reset.js          # Reset configuration
│   └── utils/
│       ├── ban.js
│       ├── claim.js
│       ├── invite.js
│       ├── kick.js
│       ├── limit.js
│       ├── lock.js
│       ├── ping.js
│       ├── stats.js
│       ├── transfer.js
│       ├── unban.js
│       └── unlock.js
├── Events/
│   ├── guildDelete.js        # Cleanup when bot leaves a guild
│   ├── interactionCreate.js  # Slash command handler
│   ├── ready.js              # Bot startup
│   └── voiceStateUpdate.js   # Temporary channel creation & deletion
├── Modules/
│   ├── cleanup.js            # Orphan channel cleanup on startup
│   ├── commandHandlers.js    # Load commands into memory
│   ├── database.js           # MySQL connection pool
│   └── deployCommands.js     # Deploy slash commands to Discord
├── .env.example
├── main.js
├── package.json
└── LICENSE
```

---

## 🆘 Support

Need help? Join our support server:

[![Discord](https://img.shields.io/badge/Discord-Join%20Support%20Server-5865F2?logo=discord&logoColor=white)](https://discord.gg/aA4mtYsUQj)

You can also open an issue on [GitHub](https://github.com/neophitt/tempvoc/issues).

---

## 📄 License

This project is licensed under the [Boost Software License 1.0](./LICENSE).
