#!/usr/bin/env bash
set -e

# Resolve repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${SCRIPT_DIR}/frontend"
VENV_DIR="${SCRIPT_DIR}/.venv"
USER_DATASETS_DIR="${SCRIPT_DIR}/user_generated_datasets"

echo "============================================================"
echo "Starting SocialVector Frontend Application"
echo "============================================================"

# Ensure user_generated_datasets directory exists
if [ ! -d "${USER_DATASETS_DIR}" ]; then
  echo "[1/3] Creating user_generated_datasets directory..."
  mkdir -p "${USER_DATASETS_DIR}"
fi

# Ensure Python virtual environment is present if available
if [ -f "${VENV_DIR}/bin/activate" ]; then
  echo "[2/3] Activating Python virtual environment..."
  source "${VENV_DIR}/bin/activate"
fi

# Check if npm packages are installed in frontend directory
cd "${FRONTEND_DIR}"
if [ ! -d "node_modules" ]; then
  echo "[3/3] Frontend dependencies not found. Installing via npm..."
  npm install
else
  echo "[3/3] Frontend dependencies verified."
fi

echo "------------------------------------------------------------"
echo "Launching Vite development server..."
echo "Open: http://localhost:5173"
echo "------------------------------------------------------------"

exec npm run dev
