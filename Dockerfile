FROM node:boron

RUN mkdir -p /src

WORKDIR /src


RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
