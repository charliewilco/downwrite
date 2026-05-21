FROM golang:1.26 AS build

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY cmd ./cmd
COPY internal ./internal
COPY Readme.md ./

RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o /out/downwrite ./cmd/downwrite

FROM debian:bookworm-slim

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /out/downwrite /usr/local/bin/downwrite

ENV DOWNWRITE_ADDR=:7878

EXPOSE 7878

ENTRYPOINT ["/usr/local/bin/downwrite"]
