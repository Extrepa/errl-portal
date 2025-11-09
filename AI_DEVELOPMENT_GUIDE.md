# AI Development Guide for Errl Portal

## 🎯 Purpose
This document helps prevent breaking changes when using AI tools (Claude, ChatGPT, etc.) to develop the Errl Portal. Follow these practices to maintain stability while iterating quickly.

---

## ⚠️ CRITICAL: Before ANY Code Changes

### 1. Run the Safety Checklist
```bash
# Run this command before asking AI to make changes:
npm test && npm run typecheck && npm run build
```

**✅ All green? Safe to proceed.**  
**❌ Any failures? Fix them first before making new changes.**

### 2. Create a Git Safety Point
```bash
# Before major changes, create a checkpoint:
git add -A
git commit -m "checkpoint: before [what you're about to change]"

# Or create a WIP branch:
git checkout -b wip/feature-name
```

**💡 Pro tip:** If AI breaks something, you can quickly revert with `git reset --hard HEAD~1`

---

## 🤖 How to Ask AI for Changes (The Safe Way)

### ❌ DON'T SAY THIS:
> "Add a new particle effect to the portal"

### ✅ DO SAY THIS:
> "I want to add a new particle effect to the portal. Before you write code:
> 1. Show me which files you'll modify
> 2. Explain what could break
> 3. Check if there are existing tests that need updating
> 4. Then write the code"

### Template for AI Requests
```
I want to [describe change].

Before implementing:
1. List all files that will be modified
2. Identify any dependencies or systems this touches
3. Check for existing tests that need updating
4. Suggest any new tests we should add
5. Then implement the change

After implementing, remind me to:
- Run npm test
- Test in the browser at [specific URL]
- Check [specific feature] still works
```

---

## 🧪 Testing Strategy

### Critical User Flows (Test These After Every Change)
Create this checklist and run through it manually:

**Portal Navigation:**
- [ ] Landing page loads without errors
- [ ] All page links work (About, Gallery, Projects, Tools)
- [ ] Back to Portal links return to main page
- [ ] No duplicate IDs (run `npm test`)

**Visual Effects:**
- [ ] WebGL effects render (no blank/black screen)
- [ ] Hue controls work in dev panel
- [ ] Background particles animate
- [ ] Bubbles/goo effects display
- [ ] Errl character renders correctly

**Pin Designer:**
- [ ] Opens without errors
- [ ] Can create/edit pins
- [ ] Export functionality works
- [ ] Canvas doesn't break on resize

**Mobile/Responsive:**
- [ ] Works on mobile viewport (Chrome DevTools)
- [ ] Touch interactions work
- [ ] No horizontal scroll

### Automated Tests
Add these tests as you go:

```bash
# Current tests (already working)
npm run test:ui  # UI component tests

# Run before every commit
npm test         # All tests
npm run typecheck # TypeScript validation
```

---

## 📁 Protected Files (Modify with Extra Care)

These files are foundational - changes here can cascade:

### Core Systems
- `src/fx/` - Visual effects system (WebGL, particles)
- `src/index.html` - Main portal entry
- `src/webgl.js` - WebGL rendering core
- `vite.config.ts` - Build configuration

### When Modifying These:
1. **Make a backup first:** `cp src/webgl.js src/webgl.js.backup`
2. **Test immediately:** Don't make multiple changes before testing
3. **Ask AI:** "What could break if we change [file]?"

---

## 🔒 Safe Development Patterns

### Pattern 1: Feature Flags
When adding new features, use flags so you can disable them:

```javascript
// In your config or at top of file
const FEATURES = {
  newParticleEffect: false,
  experimentalShaders: false,
  betaFeature: false
};

// In your code
if (FEATURES.newParticleEffect) {
  // new code here
}
```

### Pattern 2: Gradual Integration
Don't replace entire files. Add alongside existing code:

```javascript
// ❌ Don't do this:
// Delete old particle system, write new one from scratch

// ✅ Do this:
// Add new particle system as ParticleSystemV2
// Keep old one working
// Switch between them with a flag
// Remove old one only after new one is proven stable
```

### Pattern 3: Isolated Testing
Create test pages for new features:

```bash
# Create a sandbox page
touch src/test-new-feature.html
```

Test in isolation before integrating into main portal.

---

## 🚨 When Things Break - Recovery Steps

### Step 1: Don't Panic, Don't Keep Asking AI to Fix It
When something breaks, AI often makes it worse by adding more changes.

### Step 2: Identify What Broke
```bash
# Check browser console (F12)
# Look for error messages

# Check terminal for build errors
npm run build

# Check tests
npm test
```

### Step 3: Revert to Last Working State
```bash
# See recent commits
git log --oneline -5

# Revert to last working commit
git reset --hard [commit-hash]

# Or just undo last commit
git reset --hard HEAD~1
```

### Step 4: Make Smaller Changes
Break the change into 3-5 smaller steps. Test after each step.

---

## 📋 Pre-Commit Checklist

Before committing ANY AI-generated code:

```bash
# 1. Run tests
npm test

# 2. Check TypeScript
npm run typecheck

# 3. Build succeeds
npm run build

# 4. Manual browser test
npm run dev
# Then open http://localhost:5173 and click around

# 5. Check git diff
git diff
# Read through the changes - do they make sense?

# 6. Commit with clear message
git add -A
git commit -m "feat: [what changed] - tested: [what you tested]"
```

---

## 🎓 Training AI to Help Better

### Share Context
When starting a session with AI, share:
1. This guide
2. Your project structure (tree output)
3. Recent changes you've made
4. What you've tested

### Ask for Verification Steps
```
After you write code, give me:
1. Files to check manually
2. Browser tests to run
3. Command line tests to run
4. Things that might have broken
```

### Request Incremental Changes
```
Break this feature into 3 separate, testable steps.
Give me step 1 first. I'll test it and report back.
```

---

## 🔍 Quick Reference: Common Issues

### "Everything is broken after AI change"
→ `git reset --hard HEAD~1` then retry with smaller changes

### "Build fails with weird errors"
→ `rm -rf node_modules && npm install`

### "WebGL stopped working"
→ Check browser console, likely shader compilation error

### "Tests are failing"
→ Read the test output, might need to update test expectations

### "Page is blank/white screen"
→ Check console for JS errors, check network tab for failed loads

---

## 🎯 Success Metrics

You're doing it right when:
- ✅ Each AI interaction results in working code
- ✅ Tests remain green after changes
- ✅ You can explain what changed and why
- ✅ Rollback is easy if needed
- ✅ You're spending more time building than debugging

---

## 📚 Additional Resources

- [Project README](./README.md) - Project structure
- [Dev System Guide](./DEV-SYSTEM-GUIDE.md) - Development workflows
- [Tests](./tests/) - Existing test suite
- [Docs](./docs/) - Planning and ADRs

---

**Remember:** AI is a powerful tool, but YOU are the architect. Stay in control of changes, test frequently, and don't be afraid to revert and try again.
