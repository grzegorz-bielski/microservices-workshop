ARG IMAGE=node:12.1.0-alpine

FROM $IMAGE as build

ARG NPM_TOKEN
WORKDIR /app
COPY . .

RUN apk add --no-cache curl git py-pip make
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | sh
RUN npm i typescript@3.2.2 -g
RUN npm i
RUN npm run build
RUN rm -rf node_modules
RUN npm i --production
RUN ./docker/node-modules-clean.sh
RUN ./bin/node-prune

FROM $IMAGE
COPY --from=build /app/build /app/build
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/docker/prod/docker_entrypoint.sh /docker_entrypoint.sh
ENTRYPOINT [ "/docker_entrypoint.sh" ]
CMD [""]