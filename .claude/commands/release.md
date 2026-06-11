Release a new version of better-git-branch.

Ask the user what kind of release this is (patch, minor, or major) if not specified as $ARGUMENTS.

Then perform the following steps, confirming with the user before each destructive/public action (publish, push, create release):

1. Read the current version from `package.json`
2. Bump the version according to the release type (patch/minor/major)
3. Update the version in `package.json`
4. Generate a changelog entry in `CHANGELOG.md` by reading the git log since the last tag. Summarise the changes into bullet points under the new version heading.
5. Run `bun run format` to ensure code is formatted
6. Commit the changes with message: "release v<version>"
7. Tag the commit: `git tag v<version>`
8. Push the commit and tag: `git push && git push origin v<version>`
9. Publish to npm: `npm publish`
10. Create a GitHub release using `gh release create v<version> --title "v<version>"` with the latest CHANGELOG.md entry as the release notes
