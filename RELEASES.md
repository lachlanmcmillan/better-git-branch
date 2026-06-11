# Releases

## Prerequisites

- [Bun](https://bun.sh) installed
- npm account with publish access (`npm login`)

## Publishing a new version

1. Update the version in `package.json`
2. Add an entry to `CHANGELOG.md`
3. Commit the version bump
4. Tag the release:
   ```
   git tag v<version>
   git push origin v<version>
   ```
5. Publish to npm:
   ```
   npm publish
   ```
6. Create a release on github

## Verify

```
bun add -g better-git-branch
better-git-branch --version
```
