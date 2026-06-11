# Better Git Branch

Interactive TUI for navigating and managing git branches.

![demo](demo.gif)

## Installing

Requires [Bun](https://bun.sh) >= 1.0.0.

```
bun add -g better-git-branch
```

Create an alias

```
alias gb="better-git-branch"
```

## Usage

```
$ gb
```

### Keybindings

| Key    | Action                                    |
|--------|-------------------------------------------|
| ↑/↓    | Navigate the list                         |
| Enter  | Checkout branch                           |
| Ctrl+A | Toggle action menu                        |
| Ctrl+S | Toggle sort (recent first / alphabetical) |
| Esc    | Exit (or cancel action menu)              |

### Action menu

| Key     | Action              |
|---------|---------------------|
| D       | Delete branch       |
| Shift+D | Force delete branch |
| Esc     | Cancel              |

### Branch indicators

| Symbol    | Meaning                      |
|-----------|------------------------------|
| (CURRENT) | Currently checked out branch |
| M         | Merged into current branch   |
| W         | Branch is used in a worktree |
