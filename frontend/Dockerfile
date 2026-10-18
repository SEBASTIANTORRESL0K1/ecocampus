FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
# La URL del backend (visible para el navegador) se fija al construir.
ARG VITE_API_URL
ARG VITE_EXPERIMENTO_ACTIVO
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_EXPERIMENTO_ACTIVO=$VITE_EXPERIMENTO_ACTIVO
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html/ecocampus
EXPOSE 80
