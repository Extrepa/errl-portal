# AI Prompt Templates for Errl Portal

Copy and paste these templates when asking AI for help. They help AI give you safer, better code.

---

## 🎯 Template 1: Adding a New Feature

```
I want to add [describe feature] to the Errl Portal.

Project context:
- Stack: Vite, TypeScript, Vanilla JS, WebGL
- Main files: src/index.html, src/fx/, src/webgl.js
- Tests: Playwright (tests/ui.spec.ts)

Before implementing:
1. Which files will you modify?
2. Are there any dependencies or systems this will affect?
3. What could break?
4. Do any tests need to be updated?
5. Should I add new tests?

Then provide:
- The implementation code
- Step-by-step instructions to integrate it
- Manual tests I should run after

After I implement, what should I check in the browser to verify it works?
```

---

## 🔧 Template 2: Fixing a Bug

```
I'm experiencing this bug: [describe issue]

Error messages:
[paste console errors or build errors]

What I've tried:
[list what you've already attempted]

Project context:
- The bug occurs when: [describe steps]
- It affects: [which page/feature]
- Recent changes: [what did you change recently]

Please:
1. Explain what's likely causing this
2. Suggest 2-3 possible fixes (from least to most invasive)
3. For your recommended fix, provide code with comments
4. Tell me how to verify the fix works
5. Warn me about anything else that might break
```

---

## 🎨 Template 3: Improving Visual Effects

```
I want to improve/add this visual effect: [describe]

Current implementation: [link to file or describe]

Goals:
- [what do you want it to look like]
- [performance considerations]
- [user experience goals]

Constraints:
- Must work on mobile (touch)
- Should maintain 60fps
- WebGL shader budget: [if applicable]

Before implementing:
1. Show me a breakdown of the approach
2. Which files need changes?
3. Will this affect existing effects?
4. Performance implications?

Then provide:
- Implementation code with comments
- How to integrate with existing effect system
- Fallbacks for older devices/browsers
```

---

## 📦 Template 4: Refactoring Code

```
I want to refactor: [describe what code]

Why:
- [reason 1]
- [reason 2]

Current issues:
- [describe problems with current implementation]

Before refactoring:
1. Show me the refactoring plan (before/after structure)
2. Which files will change?
3. How will we maintain backward compatibility?
4. Which tests need updating?
5. Can we do this incrementally (in stages)?

For the refactoring:
- Keep functionality identical
- Improve code organization/readability
- Make it easier to test
- Don't break existing features

Provide:
- Step-by-step refactoring plan
- Code for each step
- How to test after each step
```

---

## 🧪 Template 5: Adding Tests

```
I need tests for: [feature/file]

Current test coverage: [describe existing tests]

What needs testing:
- [functionality 1]
- [functionality 2]
- [edge case 1]

Test requirements:
- Use Playwright (existing test framework)
- Follow patterns in tests/ui.spec.ts
- Should be fast (under 30 seconds total)
- Test both happy path and edge cases

Please provide:
1. Test plan (what scenarios to cover)
2. Test code following our conventions
3. Instructions to run and verify tests pass
4. What to look for if tests fail
```

---

## 🚀 Template 6: Performance Optimization

```
I need to optimize: [feature/page]

Current performance:
- [describe issue: slow load, low FPS, etc.]
- [measurements if you have them]

Target:
- [what you want to achieve]

Before optimizing:
1. What's likely causing the slowdown?
2. What are the optimization strategies? (list them)
3. Any tradeoffs I should know about?
4. How will we measure improvement?

For the optimization:
- Don't sacrifice visual quality unnecessarily
- Maintain compatibility
- Consider mobile devices
- Profile before and after

Provide:
- Optimized code with comments explaining changes
- How to verify performance improved
- Fallbacks if optimization causes issues
```

---

## 🔍 Template 7: Understanding Existing Code

```
I need to understand this code: [file or section]

Context:
- It does: [what you think it does]
- I'm confused about: [specific parts]
- I need to understand it because: [your goal]

Please explain:
1. High-level overview (what does this code accomplish?)
2. Key functions/classes and their responsibilities
3. Data flow (how information moves through the code)
4. Dependencies (what else does this rely on?)
5. Common pitfalls when modifying this

Also:
- Are there better ways to structure this?
- What should I be careful about when changing it?
- What tests cover this code?
```

---

## 📚 Template 8: Best Practices Question

```
I'm about to implement [feature] and want to do it right.

My current plan:
[describe your approach]

Questions:
- Is this the right approach for this project?
- What are the best practices I should follow?
- Common mistakes to avoid?
- How should this integrate with existing code?
- What patterns should I follow from the existing codebase?

Please provide:
- Feedback on my approach
- Recommended patterns/structures
- Example code showing best practices
- Testing strategy
```

---

## 💡 Pro Tips for Using These Templates

1. **Fill in all the brackets** - The more context you give, the better AI can help
2. **Paste actual errors** - Don't paraphrase error messages
3. **Show file structure** - Use `tree src/` or list relevant files
4. **Reference existing code** - Point AI to similar working features
5. **Ask for incremental steps** - Break big changes into testable chunks
6. **Request testing guidance** - Always ask how to verify changes work

---

## 🎓 Teaching AI About Your Project

At the start of each conversation, share:

```
I'm working on Errl Portal - a WebGL-powered interactive website.

Key info:
- Tech: Vite, TypeScript, Vanilla JS/TS, WebGL, Fabric.js
- Structure: src/index.html (main portal), src/portal/pages/* (subpages)
- Effects: src/fx/ (hue, particles, goo animations)
- Tests: Playwright in tests/
- Build: npm run build, dev: npm run dev

Current focus: [what you're working on]

See README.md and AI_DEVELOPMENT_GUIDE.md for full context.
```

Then paste one of the templates above!

---

**Remember:** Clear questions + Good context = Better AI assistance
