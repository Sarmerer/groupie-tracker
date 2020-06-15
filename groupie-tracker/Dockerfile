FROM golang:onbuild

LABEL authors="sarmerer, sarmai" \
    maintainer="sarmerer, sarmai" \
    version="1.0" \
    description="ascii-asrt-web"

RUN mkdir /app
ADD . /app
WORKDIR /app
RUN go build -o gtracker

FROM alpine:latest AS production
COPY --from=builder /app .
CMD ["./gtracker"]