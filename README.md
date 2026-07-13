# 🚀 KaamWala

A production-ready Dockerized MERN application that connects customers with skilled workers including electricians, plumbers, carpenters, mechanics, and other service providers.

The project demonstrates a complete DevOps workflow from local development to automated deployment on a Linux VPS using GitHub Actions, Docker, Docker Hub, and Nginx.

---

## ✨ Features

- 🔐 JWT Authentication
- 👤 Customer Registration
- 👷 Worker Registration
- 🛠️ Admin Dashboard
- 📅 Booking System
- ⭐ Reviews & Ratings
- 💬 Real-Time Chat (Socket.IO)
- 📦 Dockerized Frontend & Backend
- 🐳 Docker Compose
- ⚡ GitHub Actions CI/CD
- 🚀 Automatic VPS Deployment
- 🌐 Nginx Reverse Proxy
- 🗄️ MongoDB Atlas
- 🐧 Linux Server Deployment

---

# 🛠️ Tech Stack

### Frontend

<p>
<img src="https://skillicons.dev/icons?i=react,html,css,js" />
</p>

### Backend

<p>
<img src="https://skillicons.dev/icons?i=nodejs,express" />
</p>

### Database

<p>
<img src="https://skillicons.dev/icons?i=mongodb" />
</p>

### DevOps

<p>
<img src="https://skillicons.dev/icons?i=docker,githubactions,git,linux,nginx" />
</p>

---

# 🏗️ Architecture

```
                Git Push
                   │
                   ▼
          GitHub Actions CI/CD
                   │
                   ▼
          Docker Image Build
                   │
                   ▼
             Docker Hub
                   │
                   ▼
             Linux VPS
                   │
        Docker Compose Pull
                   │
                   ▼
              Nginx Proxy
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   React Frontend       Node.js Backend
                                │
                                ▼
                           MongoDB Atlas
```

---

# 📂 Project Structure

```
backend/
frontend/
docs/
.github/workflows/
docker-compose.yml
README.md
```

---

# 🚀 Run Locally

```bash
git clone https://github.com/ahsan1762/kaamwala-docker.git

cd kaamwala-docker

docker compose up --build
```

---

# 🌐 Production Deployment

The project is automatically deployed using GitHub Actions.

Deployment workflow:

- Push code to GitHub
- GitHub Actions builds Docker images
- Images are pushed to Docker Hub
- VPS pulls latest images
- Docker Compose updates containers
- Nginx serves the application

---

# 📈 Future Improvements

- ☁️ AWS EC2 Deployment
- ☸️ Kubernetes
- 🏗️ Terraform Infrastructure
- 📊 Prometheus Monitoring
- 📉 Grafana Dashboard
- 🔒 HTTPS using Let's Encrypt
  

---

# 👨‍💻 Author

**Muhammad Ahsan**

Computer Science Student
