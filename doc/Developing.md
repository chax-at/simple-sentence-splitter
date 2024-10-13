# Package Development Guide

This document describes the technical aspect of developing a package.

## Command Reference
This section describes useful commands when developing a package.

### Local linking
To test a package, you might want to use it in a project. When developing, you can [link-install](https://docs.npmjs.com/cli/v9/commands/npm-link)
the package. This is a **temporary** link to the package which will get removed, whenever you run `npm i` for the project.

This allows you to quickly iterate, using the following workflow:
1. Link-install package using commands below
2. Change package code and build it
3. The project automatically has the newly built version of this package

_Warning_: This link might behave different to a real package in some specific cases. Use the `pack` workflow below
to match the real package behavior 1:1.

```shell
npm link # create a global link for this package
```
```shell
# Run the following command in the project where you want to install the package
npm link @chax-at/[this-package-name] # link-install the package 
```
```shell
npm run build # don't forget to build the package whenever you change something
```

### Local pack
When you have finished your package and want to test it, you can pack it locally.

```shell
npm pack # this will automatically test and build the package
```

This generates a `chax-at-package-template-0.1.0.tgz` file that you can copy to the project you want to install it in.
You can install this file by editing the project's `package.json` and 
adding `@chax-at/package-template: "file:./chax-at-package-template-0.1.0.tgz"` to the `dependencies`.

### Publishing a pre-version
You can also publish a test version for your package, which is useful if you
* want someone else to test your changes before merging them to `main`
* need to quickly use your new changes in a project without waiting for the next package release

```shell
# Create a prerelease version for the new regex filter, so that it can be used in a project
# You can also use premajor, preminor, prepatch instead of prerelease
npm version prerelease --preid=new-regex-filter
# If you are not logged in yet, you have to first call
# npm login
npm publish --registry=https://nexus.corp.chax.at/repository/npm-hosted/
```

```shell
# Create a release candidate for the next minor version
npm version preminor --preid=rc
# If you are not logged in yet, you have to first call
# npm login
npm publish --registry=https://nexus.corp.chax.at/repository/npm-hosted/
```
