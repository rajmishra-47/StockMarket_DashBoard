# Makefile to manage development servers

.PHONY: run-dev help

# Default target: Show help
default: help

# Target to run both frontend and backend development servers concurrently
run-dev:
	@echo "Starting frontend (Vite) and backend (Express) servers concurrently..."
	@echo "NOTE: If 'concurrently' is not found, you might need to resolve npm install issues in the root, or ensure npx can fetch it."
	@npx concurrently --kill-others-on-fail --names "frontend,backend" --prefix-colors "bgBlue.bold,bgGreen.bold" \
		"npm run dev" \
		"npm start --prefix copilotkit-backend/"

# Target to display help information
help:
	@echo "Available commands:"
	@echo "  make run-dev    - Start both frontend and backend development servers."
	@echo "  make help       - Display this help message."

# You can add other useful commands here later, e.g.:
# install-all:
# 	@echo "Installing root dependencies..."
# 	@npm install --legacy-peer-deps # Attempt to handle potential install issues
# 	@echo "Installing backend dependencies..."
# 	@npm install --prefix copilotkit-backend/
#
# clean:
# 	@echo "Cleaning root node_modules..."
# 	@rm -rf node_modules package-lock.json
# 	@echo "Cleaning backend node_modules..."
# 	@rm -rf copilotkit-backend/node_modules copilotkit-backend/package-lock.json
