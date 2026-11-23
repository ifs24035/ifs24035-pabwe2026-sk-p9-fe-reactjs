# ---------- Tahap 1: build aplikasi React (Vite) ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# .env.production (VITE_API_BASE_URL) ikut tersalin dan dibaca saat `vite build`
COPY . .
RUN npm run build

# ---------- Tahap 2: sajikan hasil build dengan Nginx ----------
FROM nginx:1.27-alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
