docker-run:
	docker run --rm --name gtracker -p 4434:4434 -d gtracker
docker-build:
	docker build -f Dockerfile -t gtracker .
dockerize: docker-build docker-run
go-build:
	bash -c "go build -o main"
go:
	bash -c "go run main.go"
