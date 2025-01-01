# Use uma imagem base oficial do Node.js
FROM node:16

# Crie um diretório no contêiner para o aplicativo
WORKDIR /usr/src/app

# Copie o package.json e o package-lock.json para o diretório do aplicativo
COPY package*.json ./

# Instale as dependências do Node.js
RUN npm install

# Copie o restante dos arquivos do servidor para o contêiner
COPY . .

# Exponha as portas que o servidor vai usar
EXPOSE 2020 2021

# Comando para iniciar o servidor
CMD ["node", "server.js"]
