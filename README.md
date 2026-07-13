# 🚀 KaamWala
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

A production-ready MERN application that connects customers with skilled workers such as electricians, plumbers, carpenters, mechanics, and other service providers.

This project demonstrates a complete DevOps workflow from local development to automated deployment on an Ubuntu VPS using Docker, Docker Compose, GitHub Actions, Docker Hub, and Nginx Reverse Proxy.

---

## 🌟 Features

- 🔐 JWT Authentication
- 👤 Customer & Worker Registration
- 🛠️ Admin Dashboard
- 📅 Service Booking System
- ⭐ Reviews & Ratings
- 💬 Real-Time Chat (Socket.IO)
- 📦 Dockerized Frontend & Backend
- 🐳 Docker Compose
- ⚡ GitHub Actions CI/CD
- 🚀 Automatic VPS Deployment
- 🌐 Nginx Reverse Proxy
- ☁️ MongoDB Atlas
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
          Build Docker Images
                    │
                    ▼
              Push to Docker Hub
                    │
                    ▼
             Ubuntu Linux VPS
                    │
          Docker Compose Pull
                    │
                    ▼
             Nginx Reverse Proxy
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
 React Frontend          Node.js Backend
                                  │
                                  ▼
                           MongoDB Atlas
```

---

# 📸 Screenshots

## 🏠 Home Page

> <img width="959" height="516" alt="homepage" src="https://github.com/user-attachments/assets/251f672b-1400-478f-b33b-6724c85b9330" />


```markdown

```

---

## 🔐 Login Page

> <img width="959" height="516" alt="login" src="https://github.com/user-attachments/assets/183624c2-d040-4d81-b3dc-f7df5f0dc217" />


```markdown

```

---

## 👤 Customer Dashboard

> <img width="959" height="506" alt="custumer dashboard" src="https://github.com/user-attachments/assets/4a37f704-5d55-43b5-9f01-8bad22d4159a" />


```markdown

```

---

## 👷 Worker Dashboard

> <img width="959" height="510" alt="worker dashboard" src="https://github.com/user-attachments/assets/f2910aac-9a85-4b65-b5e0-f0f07e90d7c6" />


```markdown

```

---

## 🛠️ Admin Dashboard

> <img width="959" height="518" alt="admin dashboard" src="https://github.com/user-attachments/assets/5980632d-223d-4e94-bf87-cc9300c0b4db" />


```markdown

```

---

## 🐳 Docker Containers

> <img width="945" height="91" alt="Dcoker Container" src="https://github.com/user-attachments/assets/a0867dde-d88e-4a5a-9360-4905c7b68b5b" />

```markdown

```

---

## ⚡ GitHub Actions CI/CD

> <img width="959" height="389" alt="cicd" src="https://github.com/user-attachments/assets/59094098-1157-4526-8037-f2ee33e8ff89" />


```markdown

```

---

```

---

# 📂 Project Structure

```
backend/
frontend/
docs/
.github/
docker-compose.yml
README.md
```

---

# 🚀 Run Locally

```bash
git clone https://github.com/ahsan1762/kaamwala.git

cd kaamwala

docker compose up --build
```

---

# ⚙️ CI/CD Workflow

The deployment process is fully automated using GitHub Actions.

```
Developer Push
      │
      ▼
GitHub Repository
      │
      ▼
GitHub Actions
      │
      ▼
Build Docker Images
      │
      ▼
Push Images to Docker Hub
      │
      ▼
SSH into Ubuntu VPS
      │
      ▼
docker compose pull
      │
      ▼
docker compose up -d
      │
      ▼
Application Updated 🚀
```

---

# 🌍 Production Stack

- Ubuntu 24.04 VPS
- Docker
- Docker Compose
- Nginx Reverse Proxy
- GitHub Actions
- Docker Hub
- MongoDB Atlas

---

# 📈 Future Improvements

- ☁️ AWS Deployment
- ☸️ Kubernetes
- 🏗️ Terraform Infrastructure
- 📊 Prometheus Monitoring
- 📉 Grafana Dashboard
- 🔒 HTTPS with Let's Encrypt
- 🤖 AI-Powered Service Recommendation

---

# 👨‍💻 Author

**Muhammad Ahsan**

Computer Science Student

- GitHub: https://github.com/ahsan1762
