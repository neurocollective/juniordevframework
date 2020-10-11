FROM node:12

COPY package.json .
COPY index.js .
COPY config.json .
COPY api_routes ./api_routes

RUN npm i

CMD ["node", index.js]