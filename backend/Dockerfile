FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY app.js db.js validacion.js ./

# cert/ se monta como volumen (docker-compose.yml); la llave privada no va en la imagen.
USER node
EXPOSE 4006
CMD ["node", "app.js"]
