FROM node:18

RUN mkdir -p /var/www/app

WORKDIR /var/www/app

COPY package.json /var/www/app

RUN npm install && npm install pm2 -g

COPY . /var/www/app

EXPOSE 8080

CMD ["pm2-runtime", "ecosystem.config.cjs"]