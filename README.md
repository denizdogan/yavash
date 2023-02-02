# Yavash

Zero-configuration throttling HTTP proxy.

## Installation

### Command line

```console
$ deno install --allow-net --allow-read https://github.com/denizdogan/yavash/main.ts
$ yavash [--port=3123]
```

### Docker

```console
# listen on port 3123
$ docker run -p 3123:3123 denizdogan/yavash:latest

# listen on port 8811
$ docker run -p 8811:3123 denizdogan/yavash:latest
```

## Configuration

Configuration is done via the query string parameter `__YAVASH__`.

```
http://host:3123/some/path?__YAVASH__=key1:value1,key2:value2,...
```

Configuration options:

- `target` - request target URL (required)
- `minDelay` - minimum delay between every request

## Development

```console
$ deno run test -A
$ deno run bench -A
```

```console
$ docker build -t "yavash:$RELEASE_VERSION" \
    --build-arg=YAVASH_LOG_ENABLED=1 \
    --build-arg=YAVASH_PORT=3123 \
    .
```
