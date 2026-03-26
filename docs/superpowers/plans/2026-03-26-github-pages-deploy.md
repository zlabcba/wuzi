# GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the local `wuzi` project as a standalone GitHub repository under the user's account and make it shareable through GitHub Pages.

**Architecture:** Keep the project as a zero-build static site. Initialize the existing directory as its own git repository, create a matching GitHub remote repository, push the current files, and enable GitHub Pages to serve from the repository branch root.

**Tech Stack:** git, GitHub CLI (`gh`), GitHub Pages, static HTML/CSS/JavaScript

---

### Task 1: Initialize the local repository

**Files:**
- Create: `.git`
- Modify: working tree metadata only

- [ ] **Step 1: Initialize git in the current directory**

```bash
git init
```

- [ ] **Step 2: Rename the default branch to `main`**

```bash
git branch -M main
```

- [ ] **Step 3: Review the working tree**

```bash
git status --short
```

- [ ] **Step 4: Stage the project files**

```bash
git add .
```

- [ ] **Step 5: Create the initial commit**

```bash
git commit -m "feat: add Gomoku web app"
```

### Task 2: Create and connect the GitHub repository

**Files:**
- Modify: `.git/config`

- [ ] **Step 1: Create the GitHub repository under the authenticated account**

```bash
gh repo create wuzi --public --source=. --remote=origin --push
```

- [ ] **Step 2: Verify the remote**

```bash
git remote -v
```

### Task 3: Enable GitHub Pages

**Files:**
- Modify: GitHub repository settings

- [ ] **Step 1: Enable Pages from the `main` branch root**

```bash
gh api repos/zlabcba/wuzi/pages \
  --method POST \
  -f source[branch]=main \
  -f source[path]=/
```

- [ ] **Step 2: Verify the Pages settings**

```bash
gh api repos/zlabcba/wuzi/pages
```

- [ ] **Step 3: Share the public site URL**

```text
https://zlabcba.github.io/wuzi/
```

## Self-Review

### Spec coverage

- Independent GitHub repository: covered by Task 1 and Task 2.
- Public shareable link: covered by Task 3.
- Keep current local directory layout: covered by initializing the existing `wuzi` directory in place.

### Placeholder scan

- No `TODO`, `TBD`, or deferred implementation markers remain.
- All commands are concrete and executable.

### Type consistency

- The repository name is consistently `wuzi`.
- The GitHub owner is consistently `zlabcba`.
