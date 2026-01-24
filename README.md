# Orion VCS 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

Orion is a Git-inspired snapshot-based version control system built in Node.js. It implements core Git internals including blobs, trees, commits, branching, and checkout functionality, providing a deep understanding of how modern version control systems work under the hood.

## ✨ Features

- **Content-Addressable Storage**: SHA-1 based object storage system
- **Core Git Objects**: Implementation of Blob, Tree, and Commit objects
- **Branching System**: Create, list, and delete branches
- **History Traversal**: View commit history with `log` command
- **Working Tree Management**: Track file changes and staging
- **Checkout**: Switch between branches and restore working tree
- **Colored CLI Interface**: User-friendly command-line experience
- **Cross-Platform Support**: Works on Linux, macOS, and Windows

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Architecture](#architecture)
- [Development](#development)
- [Testing](#testing)
- [License](#license)

## 🚀 Installation

### Global Installation (Recommended)

```bash
npm install -g orion-vcs
```

### Local Development Installation

```bash
# Clone the repository
git clone https://github.com/sujalpahwa30/version-control-system.git
cd version-control-system

# Install dependencies
npm install

# Run Orion locally
node bin/orion.js --help
```

## 🎯 Quick Start

Initialize a new Orion repository and make your first commit:

```bash
# Initialize a new repository
orion init

# Create some files
echo "Hello World" > file.txt

# Add files to staging area
orion add file.txt

# Commit your changes
orion commit -m "Initial commit"

# View commit history
orion log

# Check repository status
orion status
```

## 📖 Commands

### `orion init`
Initialize a new Orion repository in the current directory.

```bash
orion init
```

Creates a `.orion` directory with the necessary structure:
- `objects/`: Content-addressable storage for blobs, trees, and commits
- `refs/heads/`: Branch references
- `HEAD`: Pointer to the current branch
- `index`: Staging area

### `orion add <paths...>`
Add files or directories to the staging area.

```bash
orion add file.txt
orion add src/ docs/
orion add .
```

### `orion commit -m <message>`
Create a new commit with staged changes.

```bash
orion commit -m "Add new feature"
```

**Options:**
- `-m, --message <msg>`: Commit message (required)

### `orion status`
Show the working tree status, including staged and unstaged changes.

```bash
orion status
```

### `orion log`
Display commit history for the current branch.

```bash
orion log
orion log -n 5  # Show last 5 commits
```

**Options:**
- `-n, --number <count>`: Number of commits to display (default: 10)

### `orion branch [name]`
List, create, or delete branches.

```bash
# List all branches
orion branch

# Create a new branch
orion branch feature-xyz

# Delete a branch
orion branch -d feature-xyz
```

**Options:**
- `-d, --delete`: Delete the specified branch

### `orion checkout <ref>`
Switch branches or restore working tree files.

```bash
# Switch to a branch
orion checkout main
orion checkout feature-xyz

# Checkout a specific commit
orion checkout <commit-hash>
```

## 🏗️ Architecture

Orion VCS is designed to mimic Git's internal architecture:

### Object Model

```
Repository (.orion/)
├── objects/        # Content-addressable storage
│   ├── XX/         # First 2 chars of SHA-1 hash
│   │   └── YYYY... # Remaining hash chars
├── refs/
│   └── heads/      # Branch pointers
├── HEAD            # Current branch reference
└── index           # Staging area
```

### Core Components

- **GitObject**: Base class for all version control objects
- **Blob**: Represents file content
- **Tree**: Represents directory structure
- **Commit**: Represents a snapshot with metadata
- **Index**: Manages the staging area
- **Repository**: Main interface for all operations

### How It Works

1. **Content Addressing**: Each object is stored with its SHA-1 hash as the filename
2. **Snapshots**: Commits store complete snapshots of the project tree
3. **Branching**: Branches are lightweight references to commit objects
4. **Staging**: The index tracks which files should be included in the next commit

## 🛠️ Development

### Project Structure

```
version-control-system/
├── bin/
│   └── orion.js          # CLI entry point
├── src/
│   ├── commands/         # Command implementations
│   │   ├── add.js
│   │   ├── branch.js
│   │   ├── checkout.js
│   │   ├── commit.js
│   │   ├── init.js
│   │   ├── log.js
│   │   └── status.js
│   ├── objects/          # Core object types
│   │   ├── Blob.js
│   │   ├── Commit.js
│   │   ├── GitObject.js
│   │   └── Tree.js
│   ├── index/            # Staging area
│   │   └── Index.js
│   ├── repo/             # Repository management
│   │   └── Repository.js
│   └── utils/            # Utilities
│       └── color.js
├── tests/                # Test files
├── package.json
└── README.md
```

### Dependencies

- **commander**: CLI framework for building command-line interfaces
- **chalk**: Terminal string styling
- **kleur**: ANSI color formatting

### Building from Source

```bash
# Clone the repository
git clone https://github.com/sujalpahwa30/version-control-system.git
cd version-control-system

# Install dependencies
npm install

# Run tests
npm test

# Test locally
node bin/orion.js init
```

## 🧪 Testing

The project includes basic tests for core functionality:

```bash
# Run tests
npm test

# Test GitObject functionality
node tests/gitobject.test.js

# Test blob storage
node tests/blob-storage.test.js
```

## 📚 Learning Resources

This project is an excellent learning resource for understanding:
- How version control systems work internally
- Content-addressable storage systems
- Directed Acyclic Graphs (DAGs) for commit history
- File system operations in Node.js
- Building command-line tools with Node.js

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Contribution Ideas

- Add more Git commands (merge, rebase, diff, etc.)
- Implement remote repository support
- Add a web interface
- Improve error handling and user messages
- Enhance test coverage
- Add performance optimizations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Sujal Pahwa**

- GitHub: [@sujalpahwa30](https://github.com/sujalpahwa30)

## 🙏 Acknowledgments

- Inspired by Git's internal architecture
- Built as a learning project to understand version control systems
- Thanks to the Node.js community for excellent tooling

## 🔗 Links

- [Repository](https://github.com/sujalpahwa30/version-control-system)
- [Issue Tracker](https://github.com/sujalpahwa30/version-control-system/issues)
- [NPM Package](https://www.npmjs.com/package/orion-vcs)

---

⭐ If you find this project helpful, please consider giving it a star!
