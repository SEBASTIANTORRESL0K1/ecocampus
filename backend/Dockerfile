FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# Desarrollo: el codigo se monta como volumen y nodemon reinicia al guardar (-L usa polling,
# necesario con volumenes montados desde Windows). Se usa con: build.target = dev.
FROM base AS dev
ENV NODE_ENV=development
RUN npm ci
EXPOSE 4006
CMD ["npx", "nodemon", "-L", "--ext", "js,json", "--ignore", "node_modules", "app.js"]

# Produccion (etapa por defecto): solo dependencias de ejecucion y el codigo copiado en la imagen.
# cert/ se monta como volumen; las llaves no van en la imagen.
FROM base AS prod
ENV NODE_ENV=production
RUN npm ci --omit=dev
COPY app.js db.js validacion.js ./
USER node
EXPOSE 4006
CMD ["node", "app.js"]
