This document explains how to contribute code, bug reports and documentation to the
Rječnik project. The goal is to keep contributions consistent and easy to review.

## Developing

If you're new, start by forking the repository, creating a branch for your work,
and opening a pull request when you're ready. See the sections below for details
about commits, branch names and the information we need for issues and PRs.

### Conventional Commits

We follow the Conventional Commits specification to make the history readable and
to enable automated release tooling. Use the following formats for commit messages:

- feat(scope): short description - a new feature
- fix(scope): short description - a bug fix
- docs(scope): short description - changes to documentation only
- style(scope): short description - formatting, missing semicolons, no code change
- refactor(scope): short description - code change that neither fixes a bug nor adds a feature
- perf(scope): short description - a code change that improves performance
- test(scope): short description - adding or updating tests
- chore(scope): short description - build process or auxiliary tools and libraries
- build(scope): short description - changes that affect the build system or external dependencies
- ci(scope): short description - changes to CI configuration files and scripts

Keep the subject line <= 72 characters where possible, and add a longer body after
an empty line for explanation, motivation, or trade-offs. Example:

```
feat(rjecnik-web): add quick search that filters as-you-type

Adds a client-side search box that filters the displayed list of words
without a full page reload. This improves the perceived search speed.

BREAKING CHANGE: search result URL changed from /search?q= to /results?q=
```

### Commit Scopes

Use scopes to show which part of the monorepo the change affects. Example scopes
we commonly use in this repository:

- web - the public website / next.js app
- admin - admin dashboard and upload UI
- supabase - database, functions and migrations
- docs - markdown files under `docs/`

For changes that touch multiple areas include all relevant scopes or omit the scopes if you fill it cannot be listed.

### Branch naming

Create a branch with a short, descriptive name. Prefix by type to make the
purpose obvious:

- `feat/<issue-number>-<short-description>`
- `fix/<issue-number>-<short-description>`
- `docs/<issue-number>-<short-description>`
- `chore/<issue-number>-<short-description>`

Example: `feat/123-quick-search-client-filter`

### Squashing and Rebasing Pull Requests

Keep your branch history readable. We prefer pull requests that are easy to
review and merge - aim for small, focused PRs.

- Use interactive rebase to clean up WIP commits into logical steps before
  opening a PR (or before the final push).
- If you add requested changes during review, squash or rebase locally rather
  than adding many tiny fixup commits. This keeps the final merge clean.
- When the PR is approved we typically merge with either a squash-merge or
  a merge commit depending on the project's current merge strategy (and if you cleaned up your commit correctly). The
  maintainer will choose the exact method.

If you're unsure how to rebase or squash, you can ask in the PR and a maintainer
will help.

### English vs Bosnian

This project serves Bosnian speakers, but we also welcome international
contributors. To balance inclusivity and clarity:

- Code, tests, PR description and developer-facing documentation (README, CONTRIBUTING,
  comments in code) should be written in English when possible.
- User-facing content - the website UI, data entries, examples and localized
  documentation - should be in Bosnian where appropriate.
- Issue titles: prefer English for faster review, but Bosnian
  is accepted. If you write in Bosnian and you'd like help translating to
  English for wider review, add a short English summary.

## Opening Issues

We currently support only two types of issues:

- Blank issues - use these for general discussion or questions.
- Data issues - use these to report problems with the dictionary data (missing words, incorrect entries, formatting problems, spelling, etc.).

## Funding

Rječnik is an open source project and we welcome support. At the moment we do not
have an active funding/sponsorship setup, but we plan to offer one or more of the
following options in the future:

- GitHub Sponsors - for recurring or one-time contributions through GitHub.
- Buy Me a Coffee (or similar) - a simple option for small one-time donations.

If you'd like to support the project now, please open an issue or reach out to a
maintainer and we'll share the best way to help (and update this document with
links once the funding pages are live). Any funds received will be used to
cover hosting, domain, infrastructure costs, and to compensate maintainers and collaborators working on the code, design, data or anything else we find necessary for the success of the project.
