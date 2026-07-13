# 🚀 KaamWala

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
![Home](docs/homepage.png)
```

---

## 🔐 Login Page

> *(Insert screenshot here)*

```markdown
![Login](docs/login.png)
```

---

## 👤 Customer Dashboard

> *(Insert screenshot here)*

```markdown
![Customer](docs/customer-dashboard.png)
```

---

## 👷 Worker Dashboard

> *(Insert screenshot here)*

```markdown
![Worker](docs/worker-dashboard.png)
```

---

## 🛠️ Admin Dashboard

> *(Insert screenshot here)*

```markdown
![Admin](docs/admin-dashboard.png)
```

---

## 🐳 Docker Containers

> *(Insert screenshot here)*

```markdown
![Docker](docs/docker-containers.png)
```

---

## ⚡ GitHub Actions CI/CD

> *(Insert screenshot here)*

```markdown
![GitHub Actions](docs/github-actions.png)
```

---

## 🌐 Live Deployment

> *(Insert screenshot here)*

```markdown
![Deployment](docs/live-deployment.png)
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
