# 🛡️ Quick Safety Reference Card

Keep this handy when working with AI!

---

## Before Asking AI for Changes

```bash
# 1. Run safety check
npm run safety-check

# 2. Create checkpoint
npm run checkpoint "about to add new particle effect"
```

---

## After AI Gives You Code

```bash
# 1. Review the changes
git diff

# 2. Run tests
npm test

# 3. Test in browser
npm run dev
# Then manually test in browser

# 4. If everything works
git add -A
git commit -m "feat: describe what changed"

# 5. If something broke
git reset --hard HEAD~1  # Undo everything
```

---

## How to Ask AI (Template)

```
I want to [describe change].

Before implementing:
1. List all files you'll modify
2. What could break?
3. Do tests need updating?
4. Then write the code

After implementing, remind me to:
- Run npm test
- Test at http://localhost:5173
- Check [specific feature] still works
```

---

## When Things Break

```bash
# Don't panic! Just revert:
git reset --hard HEAD~1

# Or restore from checkpoint branch:
git checkout checkpoint/[timestamp]
```

---

## Tests to Run Manually

After any change, check:
- [ ] Portal loads at http://localhost:5173
- [ ] No console errors (press F12)
- [ ] WebGL effects work
- [ ] All page links work
- [ ] Mobile view works (Chrome DevTools)

---

## Files to Be Extra Careful With

- `src/fx/` - Effects system
- `src/webgl.js` - WebGL core
- `src/index.html` - Main portal
- `vite.config.ts` - Build config

---

## Emergency Commands

```bash
# Everything is broken, go back to last commit
git reset --hard HEAD~1

# See what changed
git log --oneline -5

# Reinstall dependencies
rm -rf node_modules && npm install

# Clear build cache
rm -rf dist && npm run build
```

---

## Success Checklist

✅ Tests pass (`npm test`)  
✅ TypeScript checks pass (`npm run typecheck`)  
✅ Build succeeds (`npm run build`)  
✅ Manually tested in browser  
✅ Mobile view checked  
✅ Changes committed with clear message  

---

**Remember:** Small changes + Test frequently = Happy coding! 🎉
