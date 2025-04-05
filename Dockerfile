FROM mcr.microsoft.com/playwright:v1.51.1-jammy

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install



RUN npx playwright install

COPY . .

EXPOSE 3000

CMD ["yarn", "start"]
