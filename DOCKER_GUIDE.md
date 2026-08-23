# 🐳 Docker Deployment & Container Sharing Guide

This guide explains how to containerize the Vercel Dashboard application and share it with your subordinates/team members so they can run and test the complete app in their browser with **zero local dependencies (no Node.js, Expo, or npm required on their machines)**.

---

## ⚡ Method 1: Run Locally via Docker Compose (Fastest)

### Step 1: Ensure Docker is Running
Ensure Docker Desktop is running on your machine.

### Step 2: Build & Start Container
In the root directory of this project, run:

```bash
# Build and run the container on port 8080
docker compose up --build
```

### Step 3: Open in Browser
Open your browser and navigate to:
```
http://localhost:8080
```
*(Or test from any phone/tablet connected to the same WiFi by visiting `http://<your-computer-ip>:8080`)*.

---

## 🚀 Method 2: Share via Docker Image Archive (.tar) (No Registry Needed)

You can package the built Docker image into a single `.tar` file and send it to your subordinates via Google Drive, Slack, USB, or email.

### Step 1: Build the Docker Image
```bash
docker build -t vercel-dashboard:latest .
```

### Step 2: Save Image to a .tar File
```bash
docker save -o vercel-dashboard.tar vercel-dashboard:latest
```

### Step 3: Subordinates Load & Run the Image
Your subordinates can run the image on their machines simply by executing:

```bash
# 1. Load the container image
docker load -i vercel-dashboard.tar

# 2. Run the container
docker run -d -p 8080:80 --name vercel-app vercel-dashboard:latest
```
Then they open `http://localhost:8080` in their web browser!

---

## 🌐 Method 3: Share via Docker Hub / GitHub Packages (GHCR)

You can push the image to a container registry so your subordinates can pull it with one command.

### 1. Push to Docker Hub
```bash
# Login to Docker Hub
docker login

# Tag the image (replace yourusername with your Docker Hub username)
docker tag vercel-dashboard:latest yourusername/vercel-dashboard:latest

# Push the image
docker push yourusername/vercel-dashboard:latest
```

### 2. Subordinates Pull & Run
Your teammates run:
```bash
docker run -d -p 8080:80 yourusername/vercel-dashboard:latest
```

---

## ⚙️ Passing Vercel API Tokens in Docker

If you wish to pre-bake or pass the Vercel Token dynamically when building:

```bash
# Pass token during build
docker build --build-arg EXPO_PUBLIC_VERCEL_TOKEN="your_token_here" -t vercel-dashboard:latest .
```

Or pass it in `.env` before running `docker compose up --build`.
