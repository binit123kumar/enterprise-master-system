#!/usr/bin/env bash
set -euo pipefail

# Environment Variable Validator
# Usage: ./validate-env.sh [path/to/.env.example] [path/to/.env]
# Validates that all variables in .env.example are present in .env

EXAMPLE_FILE="${1:-.env.example}"
ENV_FILE="${2:-.env}"
EXIT_CODE=0

if [[ ! -f "$EXAMPLE_FILE" ]]; then
  echo "ERROR: $EXAMPLE_FILE not found"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found"
  exit 1
fi

echo "Validating $ENV_FILE against $EXAMPLE_FILE..."
echo ""

# Extract variable names (everything before =) from .env.example
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip comments and empty lines
  [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue

  # Extract variable name (strip everything after =, including = itself)
  var_name="${line%%=*}"

  # Check if the variable is set in the .env file (non-empty)
  if grep -q "^${var_name}=" "$ENV_FILE" 2>/dev/null; then
    value=$(grep "^${var_name}=" "$ENV_FILE" | cut -d'=' -f2-)
    if [[ -z "$value" ]]; then
      echo "⚠  WARNING: $var_name is set but empty"
    else
      echo "✓  $var_name = ${value:0:50}..." 
    fi
  else
    echo "✗  MISSING: $var_name is not defined"
    EXIT_CODE=1
  fi
done < <(grep -v '^#' "$EXAMPLE_FILE" | grep -v '^$')

echo ""
if [[ $EXIT_CODE -eq 0 ]]; then
  echo "✅ All environment variables validated successfully."
else
  echo "❌ Some environment variables are missing. Check the .env file."
fi

exit $EXIT_CODE
