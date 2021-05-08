FROM zenika/alpine-chrome:with-node


WORKDIR /usr/src/app
COPY package.json ./
RUN npm i
COPY . .

EXPOSE 3000

CMD ["yarn", "start"]