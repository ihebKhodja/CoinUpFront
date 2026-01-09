.PHONY: help install serve build test clean

# Use local Angular CLI via npx
NG = npm

help:
	@echo "Targets:"
	@echo "  make install  - install dependencies (npm ci)"
	@echo "  make run      - run dev server via npx (uses proxy.conf.json)"
	@echo "  make build    - build production bundle"
	@echo "  make test     - run tests"

install:
	ci

run:
	$(NG) start --proxy-config proxy.conf.json

build:
	$(NG) build

test:
	$(NG) test

clean:
	@echo "Nothing to clean (node_modules not removed)."
