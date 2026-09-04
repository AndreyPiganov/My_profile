.PHONY: up down logs seed test check

# Development-окружение
up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs --follow app

# Повторное заполнение базы данными из prisma/seed.ts
seed:
	docker compose run --rm migrate

test:
	npm test -- --runInBand
	npm run test:e2e -- --runInBand

check:
	npm run format:check
	npm run lint
	npm run build
	$(MAKE) test
