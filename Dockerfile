FROM node:10-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm i -g yarn && yarn install

EXPOSE 3000

CMD [ "yarn", "run", "start" ]
