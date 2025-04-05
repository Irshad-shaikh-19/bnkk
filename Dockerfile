FROM mcr.microsoft.com/playwright:v1.42.1-jammy

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

RUN npx playwright install

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]
