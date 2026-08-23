# ==========================================
# Stage 1: Build Expo Web Static Bundle
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Accept Vercel Token as build argument
ARG EXPO_PUBLIC_VERCEL_TOKEN
ENV EXPO_PUBLIC_VERCEL_TOKEN=$EXPO_PUBLIC_VERCEL_TOKEN
ENV CI=1

# Install build dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy project source code
COPY . .

# Export production static web application
RUN npx expo export --platform web

# ==========================================
# Stage 2: Production Nginx Server (~25MB)
# ==========================================
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy exported web bundle from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA fallback & gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
