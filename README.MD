# Update process

1. Bump up the version in `package.json`
2. Save all the icons under icons/{style}
3. Run `yarn clean-up` to clean up the icons.
4. Run `yarn create-release`
5. Run `yarn update-git`
6. Rebuild the other plugins.