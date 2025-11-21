# Imagen base
FROM node:20

# Carpeta de trabajo
WORKDIR /app

# Copiar los archivos del proyecto
COPY package*.json ./
RUN npm install

# Copiar todo el código
COPY . .

# Exponer el puerto (ajústalo si tu app usa otro)
EXPOSE 3000

# Comando para ejecutar tu aplicación
CMD ["npm", "start"]
