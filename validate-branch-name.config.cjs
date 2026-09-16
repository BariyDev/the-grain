module.exports = {
  errorMsg:
    "Branch name must match: main, develop or <type>/<kebab-case-name> (feat|feature|fix|hotfix|chore|refactor|test|docs|ci)",
  pattern: "^(main|develop|(feat|feature|fix|hotfix|chore|refactor|test|docs|ci)/[a-z0-9]+(-[a-z0-9]+)*)$",
};

// conventional commits reference: https://www.conventionalcommits.org/en/v1.0.0/
// feat:     a new feature
// fix:      a bug fix
// chore:    build system or external dependencies changes
// docs:     documentation only changes
// refactor: a code change that neither fixes a bug nor adds a feature
// test:     adding or correcting tests
// ci:       CI configuration changes
