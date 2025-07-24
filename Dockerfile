ARG NODE_VERSION=22.17.1

FROM node:${NODE_VERSION}-slim AS base

WORKDIR /chip8


FROM base AS install

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm i

COPY . ./


FROM install AS dev

EXPOSE 3000

CMD ["pnpm", "run", "dev"]


FROM install AS build

RUN pnpm run build


FROM base AS prod

COPY --from=build /chip8/.output/ ./

ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

CMD ["node", "/chip8/server/index.mjs"]
