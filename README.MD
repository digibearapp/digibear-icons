# Update process

1. Bump up the version in `package.json`
2. Save all the icons under icons/{style}
3. Run `yarn clean-up` to clean up the icons.
4. Create the fonts on icoMoon or a similar tool
5. Update digibear-icon-metadata.json
6. Copy the fonts and digibear-icon-metadata.json
   into the newly created release folder
7. Run `yarn create-release`
8. Run `yarn update-git`
9. Rebuild the other plugins.
