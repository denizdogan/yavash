FROM denoland/deno:1.30.0

ARG YAVASH_PORT
ENV YAVASH_PORT $YAVASH_PORT
EXPOSE $YAVASH_PORT

ARG YAVASH_LOG_ENABLED
ENV YAVASH_LOG_ENABLED $YAVASH_LOG_ENABLED

WORKDIR /app

USER deno

COPY --chown=deno ./lib ./lib
COPY --chown=deno ./deno.jsonc .
COPY --chown=deno ./deno.lock .
COPY --chown=deno ./main.ts .
COPY --chown=deno ./yavash.ohm .

RUN deno cache main.ts

CMD ["run", "-A", "main.ts"]
