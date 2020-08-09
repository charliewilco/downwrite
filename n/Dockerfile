FROM mhart/alpine-node:10

WORKDIR /usr/src/app

COPY package.json ./

COPY . .

# build process
RUN apk --no-cache --virtual build-dependencies add \
  python \
  make \
  g++
RUN npm install node-pre-gyp -g
RUN npm install
RUN npm run build
RUN npm prune --production

ENV PORT=4000
ENV MONGO_URL=mongo:27017
ENV HOST=0.0.0.0
EXPOSE 4000

CMD ["npm", "start"]
