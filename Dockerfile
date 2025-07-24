ARG NODE_VERSION=22.17.1


FROM node:${NODE_VERSION}-slim AS base

WORKDIR /chip8

ENV PNPM_HOME="/pnpm"

ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable


FROM base AS install

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . ./


FROM install AS dev

EXPOSE 3000

CMD ["pnpm", "run", "dev"]


FROM install AS build

RUN pnpm run build


FROM base AS prod

RUN pnpm install pm2 -g

COPY --from=build /chip8/.output/ ./

ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

CMD ["pm2-runtime", "/chip8/server/index.mjs"]
