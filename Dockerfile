FROM golang:latest
LABEL authors="sarmerer, sarmai" \
    maintainer="sarmerer, sarmai" \
    version="1.0" \
    description="groupie-tracker"
RUN mkdir /app
WORKDIR /app
COPY . /app
RUN go build -o main .
EXPOSE 4434
CMD ["./main", "--prod"]