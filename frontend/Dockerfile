# Autonomous Blogger — React + Vite Frontend Cloud Run Container
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build production assets
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Support dynamic Cloud Run PORT
CMD exec sh -c "sed -i 's/listen       80;/listen       '\${PORT:-80}';/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
