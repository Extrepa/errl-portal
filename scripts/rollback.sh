#!/bin/bash
# Quick rollback helper: reset to the previous safe point without losing your work forever.

set -euo pipefail

TARGET_REF="${1:-}"
TARGET_DESC=""

require_git_repo() {
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "❌ Not inside a git repository."
    exit 1
  fi
}

pick_target() {
  if [ -n "$TARGET_REF" ]; then
    TARGET_DESC="specified commit ($TARGET_REF)"
    return
  fi

  local checkpoint_hash
  checkpoint_hash=$(git log --grep='^checkpoint:' -n 1 --format='%H' 2>/dev/null || true)
  if [ -n "$checkpoint_hash" ]; then
    TARGET_REF="$checkpoint_hash"
    TARGET_DESC="latest checkpoint commit"
    return
  fi

  TARGET_REF="HEAD~1"
  TARGET_DESC="previous commit"
}

confirm_target_exists() {
  if ! git rev-parse --verify "$TARGET_REF" >/dev/null 2>&1; then
    echo "❌ Unable to locate commit: $TARGET_REF"
    echo "   Provide a valid reference, e.g. 'scripts/rollback.sh HEAD~2'"
    exit 1
  fi
}

confirm_action() {
  local short_current short_target
  short_current=$(git rev-parse --short HEAD)
  short_target=$(git rev-parse --short "$TARGET_REF")

  echo "⚠️  Rolling back from $short_current to $short_target ($TARGET_DESC)."
  echo "   Your current state will be saved before resetting."
  read -r -p "Proceed? (y/N) " answer
  if [[ ! "$answer" =~ ^[Yy]$ ]]; then
    echo "➡️  Rollback cancelled."
    exit 0
  fi
}

stash_uncommitted_changes() {
  if git diff --quiet && git diff --cached --quiet; then
    return
  fi

  STASH_NAME="rollback-$(date +%Y%m%d-%H%M%S)"
  echo "💾 Saving uncommitted changes to stash ($STASH_NAME)..."
  git stash push -u -m "$STASH_NAME" >/dev/null
  SAVED_STASH_REF=$(git stash list | head -n 1 | cut -d: -f1)
}

create_backup_branch() {
  BACKUP_BRANCH="rollback/$(date +%Y%m%d-%H%M%S)"
  git branch "$BACKUP_BRANCH" >/dev/null
}

perform_reset() {
  git reset --hard "$TARGET_REF" >/dev/null
}

summarize() {
  local new_head
  new_head=$(git rev-parse --short HEAD)
  echo "✅ Rolled back to commit $new_head ($TARGET_DESC)."
  echo "📌 Previous tip saved on branch: $BACKUP_BRANCH"
  if [ -n "${SAVED_STASH_REF:-}" ]; then
    echo "🧳 Uncommitted work saved as: $SAVED_STASH_REF"
    echo "   Restore later with: git stash apply $SAVED_STASH_REF"
  fi
  echo ""
  echo "Need to undo the rollback? Simply run:"
  echo "  git checkout $BACKUP_BRANCH"
}

require_git_repo
pick_target
confirm_target_exists
confirm_action
stash_uncommitted_changes
create_backup_branch
perform_reset
summarize
