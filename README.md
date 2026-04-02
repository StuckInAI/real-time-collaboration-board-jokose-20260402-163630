# SharedSpace — Live Collaboration Workspace

A real-time shared workspace built with **Next.js 14**, **Tailwind CSS**, and **Socket.IO** (demo uses localStorage sync for cross-tab collaboration).

## Features

- 🚀 **Live Updates** — Changes sync across browser tabs in real-time
- 👥 **Team Presence** — See who's online with colored avatars
- 💬 **Live Chat** — Instant messaging within the workspace
- 📄 **Shared Documents** — Create, edit, and collaborate on documents
- 🔑 **Private Rooms** — Each workspace has a unique shareable Room ID
- 📱 **Responsive** — Works on desktop and mobile

## Getting Started

### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Docker

```bash
# Build the image
docker build -t sharedspace .

# Run the container
docker run -p 3000:3000 sharedspace
```

Open [http://localhost:3000](http://localhost:3000)

### Docker Compose

```bash
docker-compose up
```

## How It Works

1. **Create a workspace** — Enter your name and click "Create New Workspace"
2. **Share the Room ID** — Copy the 8-character Room ID from the top bar
3. **Invite teammates** — Share the ID so others can join
4. **Collaborate** — Edit documents, chat, and see who's online

> **Note:** The demo uses `localStorage` + `StorageEvent` for real-time sync across browser tabs on the same device. For production multi-user sync, integrate Socket.IO with a Node.js server.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Socket.IO** (ready for integration)
- **Docker** (multi-stage build)
- **lucide-react** (icons)
