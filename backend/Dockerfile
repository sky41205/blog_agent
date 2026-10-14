# Autonomous Blogger — Node.js Backend Cloud Run Container
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies if required
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Cloud Run injects the PORT environment variable (default: 5000)
ENV PORT=5000
ENV NODE_ENV=production
ENV GOOGLE_PROJECT_ID=bolg-agent
ENV AI_PROVIDER=vertex

EXPOSE 5000

# Start server
CMD ["node", "server.js"]
