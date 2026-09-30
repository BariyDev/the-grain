# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-09-29

### Added

- Project documentation in `docs/`: architecture, development guide, API reference and internationalization
- `AGENTS.md` with instructions for AI coding agents

## [1.1.0] - 2026-09-22

### Added

- Interface localization: English and Russian with a header switch
- Locale-aware dates (Today / Yesterday / full date) via `datetimeFormats` and `d()`
- Pluralized posts counter via `pluralRules` (Russian rule from the vue-i18n docs)
- Saved language preference in `localStorage`

## [1.0.1] - 2026-09-16

### Fixed

- README: removed a leftover comment in the Screenshots section, fixed the Getting started numbering and added the clone step
- CHANGELOG: corrected release dates

## [1.0.0] - 2026-09-16

### Added

- Project documentation: README with screenshots, FAQ and API reference
- GNU GPL v3.0 license

## [0.3.0] - 2026-09-16

### Added

- Post feed with cards, per-post author and time stamp
- Public post creation form for authenticated users
- Day grouping with Today / Yesterday dividers

## [0.2.0] - 2026-09-16

### Added

- Vue 3 client with router, dark design system and app icon
- Registration page, login page and logout
- Client type check and production build in CI

## [0.1.0] - 2026-09-16

### Added

- Project tooling: ESLint, Prettier and husky git hooks with conventional commits
- Continuous integration with GitHub Actions (formatting and linting)
- Elysia API with CORS and unified error handling
- User registration with password hashing, login with JWT, current user profile
- Post creation and public feed with authors
- PostgreSQL in Docker with Drizzle ORM and migrations
