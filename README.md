# Yavash

Zero-configuration throttling HTTP proxy.

[![Docker](https://github.com/denizdogan/yavash/actions/workflows/docker-ci.yml/badge.svg)](https://github.com/denizdogan/yavash/actions/workflows/docker-ci.yml)

## Installation

### Command line

```console
$ deno install -A https://github.com/denizdogan/yavash/main.ts
$ yavash [--port=3123]
```

### Docker

```console
# pull from github container registry
$ docker pull ghcr.io/denizdogan/yavash:latest

# listen on port 3123
$ docker run -p 3123:3123 ghcr.io/denizdogan/yavash:latest

# listen on port 8811
$ docker run -p 8811:3123 ghcr.io/denizdogan/yavash:latest
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

Run tests and benchmarks:

```console
$ deno run test -A
$ deno run bench -A
```

Build local Docker image:

```console
$ docker build -t yavash:local \
    --build-arg=YAVASH_LOG_ENABLED=1 \
    --build-arg=YAVASH_PORT=3123 \
    .
```

Run GitHub Actions in local Docker:

```console
$ act --container-architecture linux/amd64
```
