LINT_PATHS = accounts/ collection/ listings/ optimart/ services/ manage.py

include .env.dev

lint:
	isort $(LINT_PATHS) --diff --check-only
	ruff $(LINT_PATHS)

format:
	isort $(LINT_PATHS)
	ruff $(LINT_PATHS) --fix
	black $(LINT_PATHS)

runserver:
	@echo 'Running optimart development server...'
	python -X dev manage.py runserver