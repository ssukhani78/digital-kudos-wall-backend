#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Ensure we're in the project root
cd "$(dirname "$0")/.." || exit 1

# Load environment variables from .env.test.local if it exists
if [ -f .env.test.local ]; then
    echo "📝 Loading configuration from .env.test.local"
    export $(cat .env.test.local | grep -v '^#' | xargs)
fi

# Check if we have access to the Pact Broker URL from environment
if [ -z "$PACT_BROKER_BASE_URL" ] || [ -z "$PACT_BROKER_TOKEN" ]; then
    echo "❌ Error: Missing Pact Broker configuration"
    echo "Please ensure you have set up your .env.test.local file with:"
    echo "PACT_BROKER_BASE_URL=your_broker_url"
    echo "PACT_BROKER_TOKEN=your_token"
    echo ""
    echo "Or export these variables in your shell:"
    echo "export PACT_BROKER_BASE_URL=your_broker_url"
    echo "export PACT_BROKER_TOKEN=your_token"
    exit 1
fi

# Get Git information
if command_exists git; then
    export GIT_COMMIT=$(git rev-parse HEAD)
    export GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
else
    export GIT_COMMIT="local"
    export GIT_BRANCH="local"
fi

# Run the tests
echo "🧪 Running contract tests..."
echo "📝 Git Information:"
echo "   Commit: $GIT_COMMIT"
echo "   Branch: $GIT_BRANCH"
echo "🔗 Pact Broker: $PACT_BROKER_BASE_URL"

# Run the actual tests
NODE_ENV=test npm run test:contract 