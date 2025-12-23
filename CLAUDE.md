# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based personal tech blog hosted on GitHub Pages at https://dasoldasol.github.io. The site uses the Minimal Mistakes theme (remote theme) and contains 128+ blog posts primarily covering AWS, data engineering, machine learning, and algorithms.

## Common Commands

```bash
# Install dependencies
bundle install

# Run local development server (accessible at http://localhost:4000)
bundle exec jekyll serve

# Build the site (outputs to _site/)
bundle exec jekyll build

# Clean generated files
bundle exec jekyll clean
```

## Architecture

### Content Structure
- **_posts/**: Blog posts in Markdown (named `YYYY-MM-DD-slug.md`)
- **_pages/**: Static pages (about.md, projects.md, category-archive.md, tag-archive.md, 404.md)
- **_data/navigation.yml**: Main navigation menu configuration

### Theme Structure (Minimal Mistakes)
- **_layouts/**: Page templates (default.html, single.html, home.html, archive.html)
- **_includes/**: Reusable template partials (masthead.html, sidebar.html, author-profile.html)
- **_sass/minimal-mistakes/**: Theme SCSS files with `skins/` for color schemes
- **assets/css/main.scss**: Main stylesheet entry point

### Post Front Matter
```yaml
---
title: "Post Title"
excerpt: "Brief description for previews"
toc: true
toc_sticky: true
categories:
  - CategoryName
modified_date: 2024-12-05 08:36:28 +0900
---
```

### Key Configuration (_config.yml)
- Remote theme: `mmistakes/minimal-mistakes`
- Permalink: `/:categories/:title/`
- Pagination: 5 posts per page
- Locale: Korean (ko-KR)
- Timezone: Asia/Seoul

## Deployment

The site deploys automatically via GitHub Pages when changes are pushed to the master branch. No CI/CD workflows are configured; GitHub Pages handles Jekyll builds natively.

## Working rules for this repository

- Before making any changes, propose a plan: which files you will change, why, and the expected size of the diff.
- For this onboarding task, only modify documentation files: README.md and CLAUDE.md.
- Do not modify build/deploy or Jekyll config files (e.g., Gemfile, Gemfile.lock, _config.yml) unless I explicitly approve.
- Keep diffs small. Avoid broad reformatting or unrelated cleanups.
- If you suggest commands to run, prefer read-only commands first. Ask before running anything that changes the environment.
- I (the user) will run git commit and git push myself.
