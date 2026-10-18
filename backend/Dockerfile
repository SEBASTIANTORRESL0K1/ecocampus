FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# Desarrollo: el codigo (src/) se monta como volumen y nodemon reinicia al guardar. -L usa polling,
# necesario con volumenes montados desde Windows. Se usa con: build.target = dev.
FROM base AS dev
ENV NODE_ENV=development
RUN npm ci --ignore-scripts
EXPOSE 4006
CMD ["npm", "run", "dev"]

# Compilacion: TypeScript -> dist/ (con todas las dependencias, incluidas las de desarrollo).
FROM base AS build
RUN npm ci --ignore-scripts
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# Produccion (etapa por defecto): solo dependencias de ejecucion y el JavaScript compilado.
# cert/ se monta como volumen; las llaves no van en la imagen.
FROM base AS prod
ENV NODE_ENV=production
RUN npm ci --omit=dev --ignore-scripts
COPY --from=build /app/dist ./dist
USER node
EXPOSE 4006
CMD ["node", "--enable-source-maps", "dist/server.js"]
