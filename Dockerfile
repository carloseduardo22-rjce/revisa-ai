FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/revisa-ai /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
