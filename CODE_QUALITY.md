# Code Quality Tools - Setup Guide

## Overview

This project uses several code quality tools to maintain high standards:

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **Lefthook** - Git hooks (currently disabled on Windows)
- **GitHub Actions** - CI/CD pipeline

## Quick Start

### Available npm Scripts

```bash
# Linting
npm run lint              # Check for linting errors
npm run lint:fix          # Auto-fix linting errors

# Formatting
npm run format            # Format all files with Prettier
npm run format:check      # Check formatting without making changes

# Testing
npm test                  # Run tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report

# Type Checking
npm run type-check        # Run TypeScript compiler without emitting files

# All Quality Checks
npm run quality           # Run type-check, lint, format-check, and test
```

## Git Hooks (Lefthook) - Windows Issue

### Current Status

Lefthook has a known compatibility issue on Windows that causes commits to fail with a panic error. The hooks have been **temporarily uninstalled** to allow normal git operations.

### Workaround Options

#### Option 1: Manual Quality Checks (Recommended for Windows)

Before committing, run the quality check command manually:

```bash
npm run quality
```

Or run individual checks:

```bash
npm run lint:fix      # Fix linting issues
npm run format        # Format code
npm run type-check    # Check TypeScript
npm test              # Run tests
```

#### Option 2: Use Husky Instead (Alternative)

If you need automated git hooks on Windows, consider using Husky:

```bash
# Install Husky
npm install --save-dev husky

# Initialize Husky
npx husky init

# Add pre-commit hook
echo "npm run lint:fix && npm run format && npm run type-check" > .husky/pre-commit

# Add pre-push hook
echo "npm test && npm run build" > .husky/pre-push
```

#### Option 3: Re-enable Lefthook (For Unix-based systems or WSL)

If you're using WSL, Linux, or macOS, you can reinstall Lefthook hooks:

```bash
npx lefthook install
```

#### Option 4: Commit Without Hooks (Quick Fix)

If hooks are installed and causing issues:

```bash
# Uninstall Lefthook hooks
npx lefthook uninstall

# Make your commit
git commit -m "your message"

# (Optional) Reinstall for next time
npx lefthook install
```

## GitHub Actions CI/CD

The project includes a GitHub Actions workflow that runs automatically on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### What it checks:

1. **Type checking** - TypeScript compilation
2. **Linting** - ESLint checks
3. **Formatting** - Prettier formatting verification
4. **Tests** - Jest unit tests with coverage
5. **Build** - Next.js production build
6. **Security** - npm audit for vulnerabilities

Even without local git hooks, **all code pushed to GitHub will be validated automatically**.

## VS Code Integration

The project includes VS Code settings that enable:

- **Format on save** - Automatically formats files using Prettier
- **ESLint auto-fix on save** - Fixes linting issues automatically
- **Organize imports on save** - Keeps imports tidy

### Recommended Extensions

Install these VS Code extensions for the best experience:

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
- Jest (`orta.vscode-jest`)

## Best Practices

1. **Before committing**, run `npm run quality` to ensure your code passes all checks
2. **Write tests** for new features and bug fixes
3. **Use meaningful commit messages** that describe what changed and why
4. **Keep formatting consistent** by using Prettier
5. **Fix linting errors** before pushing code

## Troubleshooting

### ESLint errors

```bash
npm run lint:fix  # Auto-fix most issues
```

### Formatting issues

```bash
npm run format  # Format all files
```

### Test failures

```bash
npm run test:watch  # Run tests in watch mode for debugging
```

### Build errors

```bash
npm run type-check  # Check for TypeScript errors
npm run build       # Attempt a production build
```

## CI/CD Status

Check the "Actions" tab in GitHub to see the status of automated checks on your pull requests and commits.

Green checkmarks ✅ mean all quality checks passed!
Red X marks ❌ mean something needs to be fixed.
