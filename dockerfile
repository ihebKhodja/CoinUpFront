# Stage 1: Build the Angular app
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Angular 20+: use configuration flag ("--prod" is deprecated)
RUN npm run build -- --configuration production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# SPA routing fallback + cache headers
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Generate env.js at container startup from env vars (BACKEND_URL)
COPY docker/10-env.sh /docker-entrypoint.d/10-env.sh
RUN chmod +x /docker-entrypoint.d/10-env.sh

# Copy the built app from Stage 1
COPY --from=build /app/dist/CoinUpFront/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
