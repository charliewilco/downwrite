FROM mhart/alpine-node:10


RUN mkdir /app
WORKDIR /app

RUN yarn global add typescript nodemon

ADD ./package.json .
RUN npm install