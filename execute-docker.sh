#!/bin/bash
docker build -f Dockerfile -t gtracker .
docker run --name gtracker -p 4242:4242 -d gtracker