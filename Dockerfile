# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --base=/ && sed -i "s/__BUILD_ID__/$(date +%s)/" dist/sw.js

# Stage 2: Serve
FROM nginx:1.30-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-kiosk.conf /etc/nginx/conf.d/default.conf

# Fix file permissions for nginx (non-root user)
RUN chmod -R a+r /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
