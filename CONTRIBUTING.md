# Contributing to PhotoIdentifier

Thank you for your interest in contributing to PhotoIdentifier! This document provides guidelines and information for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots or screencasts (if applicable)
- Environment details (OS, browser, Node.js version)
- Any relevant logs or error messages

### Suggesting Enhancements

We welcome enhancement suggestions! When suggesting a new feature:

- Use a clear and descriptive title
- Provide a detailed description of the proposed enhancement
- Explain why this enhancement would be useful
- If possible, include mockups or examples

### Pull Requests

We love pull requests! Here's how to contribute:

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   git clone https://github.com/YOUR_USERNAME/Super_Prismora.git
   cd Super_Prismora
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make your changes**
   - Follow the coding standards outlined in [DEVELOPER.md](DEVELOPER.md#coding-standards)
   - Add tests for new functionality
   - Update documentation as needed
   - Ensure all tests pass

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   # or
   git commit -m "fix: resolve the bug description"
   ```

   Use [Conventional Commits](https://www.conventionalcommits.org/) format:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding or updating tests
   - `chore:` for build process or auxiliary tool changes

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Provide a clear description of your changes
   - Reference any related issues (e.g., "Fixes #123")

## 📝 Development Setup

See [DEVELOPER.md](DEVELOPER.md) for detailed development setup instructions.

## 🎯 Development Workflow

1. **Create an issue** (if one doesn't exist) to discuss your proposed changes
2. **Create a branch** from `main`
3. **Implement your changes**
4. **Test thoroughly**
5. **Submit a pull request**

## 📏 Code Style

### TypeScript

- Use strict TypeScript
- Avoid `any` type
- Define proper return types
- Use interfaces for object shapes

### React

- Use functional components with hooks
- Use TypeScript for props
- Avoid class components

### Styling

- Use Tailwind CSS utility classes
- Prefer design tokens over custom values
- Avoid inline styles

See [DEVELOPER.md](DEVELOPER.md#coding-standards) for more details.

## 🧪 Testing

We appreciate test coverage! Please:

- Write tests for new features
- Ensure all tests pass before submitting
- Update tests if you change existing functionality

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch
```

## 📚 Documentation

Keep documentation up to date:

- Update README.md for user-facing changes
- Update DEVELOPER.md for developer-facing changes
- Add inline comments for complex logic
- Update TypeScript types if you change data structures

## 🚀 Release Process

Releases are managed by the maintainers. The process involves:

1. Bumping version numbers
2. Creating a release commit
3. Creating a GitHub release
4. Publishing to npm (if applicable)

## 📄 License

By contributing to PhotoIdentifier, you agree that your contributions will be licensed under the MIT License.

## 🎖️ Recognition

Contributors will be recognized in the project. Your name will appear in the contributors list on GitHub.

## 💬 Getting Help

If you need help:

- Check existing issues and pull requests
- Read the [README.md](README.md) and [DEVELOPER.md](DEVELOPER.md)
- Join our community discussions
- Create an issue for questions

## 🌟 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of different viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments
- Personal or political attacks
- Public or private harassment
- Publishing others' private information

### Enforcement

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned with this Code of Conduct.

## 🎉 Thank You

Thank you for contributing to PhotoIdentifier! We appreciate your time and effort in making this project better.

---

For more information, please see:
- [README.md](README.md) - Project overview
- [DEVELOPER.md](DEVELOPER.md) - Developer documentation
- [Issues](https://github.com/itsaslamopenclawdata/Super_Prismora/issues) - Report bugs or request features
