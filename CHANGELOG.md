# Changelog

## v2.1.0

- Add worktree indicator (W) for branches used in linked worktrees
- Add color scheme: soft yellow status indicators, green (CURRENT) label, dim dates
- Command bar shows MERGED/WORKTREE status for selected branch on right side
- Command bar switches to yellow/amber background in action mode
- Bracketed key style for command bar shortcuts
- Enter on current branch now closes the program

## v2.0.0

- Rewrite from Rust to Bun/TypeScript
- Zero runtime dependencies — raw ANSI terminal rendering
- Branch list sorted by most recent commit
- Toggle sort between recent first and alphabetical (Ctrl+S)
- Show merge status (M) and last commit date per branch
- Action menu for branch deletion (Ctrl+A)
- Force delete support (Shift+D)
- Confirmation modal infrastructure
