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

## 🌐 Method 3: Share via Docker Hub (Live Repository)

The image is already pushed and live on Docker Hub at **`vishal4248/vercel-app`**!

### Subordinates Pull & Run (1-Command Testing)
Your teammates / subordinates just run this single command on their machines:

```bash
docker run -d -p 8080:80 --name vercel-app vishal4248/vercel-app:latest
```

Then open `http://localhost:8080` in any browser!

---

### Pushing New Updates to Docker Hub:
```bash
# 1. Build new image
docker build -t vishal4248/vercel-app:latest -t vishal4248/vercel-app:v1.0.0 .

# 2. Push updates to Docker Hub
docker push vishal4248/vercel-app:latest
docker push vishal4248/vercel-app:v1.0.0
```

---

## ⚙️ Passing Vercel API Tokens in Docker

If you wish to pre-bake or pass the Vercel Token dynamically when building:

```bash
# Pass token during build
docker build --build-arg EXPO_PUBLIC_VERCEL_TOKEN="your_token_here" -t vercel-dashboard:latest .
```

Or pass it in `.env` before running `docker compose up --build`.
