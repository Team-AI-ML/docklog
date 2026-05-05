# DockLog 🐳

<p align="center">
  <img src="frontend/public/logo-horizontal.png?v=2" alt="DockLog Logo" width="400">
</p>

<p align="center">
  <strong>High-performance, real-time Docker log viewer for teams.</strong><br>
  Built with Go 1.24 and Vue 3 for speed, security, and a premium monitoring experience.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/UI-Compact--Airy-6366f1" alt="UI">
  <img src="https://img.shields.io/badge/Backend-Go--1.26-00add8" alt="Backend">
  <img src="https://img.shields.io/badge/Frontend-Vue--3-42b883" alt="Frontend">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
</p>

---

## ✨ Features

### 🎨 Premium "Compact-Airy" UI

- **Minimalist Aesthetic**: A spacious, glassmorphic dark-mode interface that prioritizes readability and looks premium.
- **Smart Truncation**: Single-line container lists with intelligent hover expansion to prevent layout breakage.
- **Micro-animations**: Smooth transitions and reactive elements for a state-of-the-art SaaS feel.

### 🔐 Advanced RBAC (Role-Based Access Control)

- **Granular Visibility**: Assign specific container visibility to staff members using **Wildcards** (e.g., `backend*`) or **Regex**.
- **Action Rights**: Enable/Disable specific rights per user (Start, Stop, Restart, Delete).
- **Restricted vs. Full Access**: Easily toggle between broad container access and restricted subsets.

### 🕵️ Audit & Security

- **Full Traceability**: Every administrative change and staff action is logged with a timestamp and status.
- **First-Login Security**: Forced password change policy for all new accounts.
- **JWT Authentication**: Secure, token-based session management with encrypted local storage.

### ⚡ High Performance & Reliability

- **WebSocket Streaming**: Real-time log tailing with minimal latency.
- **Self-Healing Streams**: Automatic reconnection logic for logs and stats if the backend connection is interrupted.
- **Connectivity Monitoring**: Real-time status detection for both internet and backend connectivity with instant toast notifications.
- **Smart Refresh**: The sidebar container list auto-refreshes every 5 seconds to ensure status indicators stay synchronized.
- **Lightweight Footprint**: Written in Go for extremely low CPU and memory overhead.
- **Single-Binary Deployment**: The Go server embeds the entire frontend for easy distribution.

---

## 🛠 Tech Stack

- **Core**: Go 1.24, Echo Framework, Moby Docker SDK.
- **Frontend**: Vue.js 3, Vite, pnpm, Vanilla CSS (Custom Design System).
- **Storage**: SQLite for user management and audit logs.
- **Networking**: WebSockets for live logs, REST for management.

---

## 📚 Documentation

- [**Architecture Overview**](docs/ARCHITECTURE.md) - Deep dive into how DockLog works.
- [**Security & RBAC**](docs/SECURITY.md) - Details on our security model and permission system.

---

## ⚙️ Configuration

### Environment Variables

DockLog can be configured using environment variables:

| Variable      | Description                       | Default                       |
| :------------ | :-------------------------------- | :---------------------------- |
| `SECRET_KEY`  | Key used for signing JWT tokens.  | `secret-key-change-this`      |
| `DB_PATH`     | Path to the SQLite database file. | `docklog.db`                  |
| `DOCKER_HOST` | The Docker daemon socket path.    | `unix:///var/run/docker.sock` |

> [!IMPORTANT]
> **Security Requirement**: You must generate a secure `SECRET_KEY` for JWT signing in production. Use this command to generate a random key:
>
> ```bash
> openssl rand -base64 32
> ```

---

## 👥 User Roles & Permissions

### 👑 Global Administrator

- Full visibility of all containers.
- Account management (Create/Delete/Reset Passwords).
- Access to full audit logs.

### 🛠️ Staff Member

Visibility is controlled via **Patterns** (e.g., `redis`, `backend*`, `prod-*, *-app`).
Users only see and can only interact with containers that match their assigned patterns.

---

## 🚀 Getting Started

### 🔑 Initial Credentials

- **Username**: `admin`
- **Password**: `admin123`
- _Note: You will be prompted to change your password on the first login._

### 🐳 Deployment (Docker Compose)

```yaml
version: "3.8"
services:
  docklog:
    image: aimldev/docklog:latest
    container_name: docklog
    ports:
      - "8888:8000"
    environment:
      - SECRET_KEY=your-secure-key-here
      - DB_PATH=/app/data/docklog.db
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./data:/app/data
    restart: unless-stopped
```

```bash
make up
```

This will create `./data/docklog.db` automatically inside the mounted volume, then start the stack.

### 🐳 Deployment (Direct Docker Run)

```bash
docker run -d \
  --name docklog \
  -p 8888:8000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(pwd)/data:/app/data \
  -e SECRET_KEY=your-secure-key-here \
  -e DB_PATH=/app/data/docklog.db \
  --restart unless-stopped \
  aimldev/docklog:latest
```

### 📦 Docker Hub
The official image is available on Docker Hub: [**aimldev/docklog**](https://hub.docker.com/r/aimldev/docklog)

---

## 📂 Project Structure

- `main.go`: Multi-functional Go server (API, WebSockets, Asset Server).
- `db/`: SQLite database initialization and schema.
- `frontend/`: The Vue 3 single-page application.
- `.github/workflows/`: CI/CD pipeline for Docker Hub deployment.

---

## 📜 License

MIT
