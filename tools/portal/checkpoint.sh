#!/bin/bash
# Create a safe checkpoint before making changes

if [ -z "${1:-}" ]; then
  echo "Usage: ./tools/portal/checkpoint.sh 'description of what you're about to change'"
  exit 1
fi

DESCRIPTION="$1"
BRANCH_NAME="checkpoint/$(date +%Y%m%d-%H%M%S)"

echo "📸 Creating safety checkpoint..."
echo ""

# Save current work
git add -A

# Create commit
git commit -m "checkpoint: $DESCRIPTION"

# Create backup branch
git branch "$BRANCH_NAME"

echo ""
echo "✅ Checkpoint created!"
echo ""
echo "📌 Branch saved as: $BRANCH_NAME"
echo ""
echo "💡 If AI breaks something, you can restore with:"
echo "   git reset --hard HEAD~1"
echo ""
echo "💡 Or switch to the backup branch:"
echo "   git checkout $BRANCH_NAME"
echo ""
