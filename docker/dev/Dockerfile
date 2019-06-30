ARG IMAGE=node:12.1.0-alpine
FROM $IMAGE as builder

WORKDIR /app
COPY . .

RUN apk add --no-cache bash git py-pip make curl
RUN rm -rf .git
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | sh
RUN npm i --no-package-lock
RUN npm run build
RUN npm install node-dev@3.1.3 -g
RUN ./docker/node-modules-clean.sh
RUN npm dedupe
RUN npm cache clean --force
RUN ./bin/node-prune
RUN apk del git py-pip make

## SERVICE container
FROM $IMAGE as service
WORKDIR /app
COPY . .
COPY --from=builder /app/build /app/build
COPY --from=builder /usr/local/lib/node_modules/node-dev /usr/local/lib/node_modules/node-dev
RUN ln -s /usr/local/lib/node_modules/node-dev/bin/node-dev /usr/local/bin/node-dev