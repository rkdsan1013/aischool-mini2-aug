FROM node:22-alpine

RUN apk update && apk upgrade

WORKDIR /app

COPY package*.json ./
ENV NODE_ENV=development
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]