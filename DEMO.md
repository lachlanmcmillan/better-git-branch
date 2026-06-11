# Recording the demo

## Prerequisites

- [asciinema](https://asciinema.org) — `brew install asciinema`
- [agg](https://github.com/asciinema/agg) — `brew install agg`

## Record

```
asciinema rec demo.cast
```

Run through the app:

1. Run `gb`
2. Navigate up/down through branches
3. Show sort toggle (Ctrl+S)
4. Show action menu (Ctrl+A), then cancel (Esc)
5. Checkout a branch (Enter)

Press Ctrl+D or type `exit` to stop recording.

## Convert to GIF

```
agg demo.cast better-git-branch-demo.gif
```
