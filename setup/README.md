# appgardenstudios/hyaline-actions/setup
The `appgardenstudios/hyaline-actions/setup` action is a JavaScript action that sets up [Hyaline](https://github.com/appgardenstudios/hyaline) in your GitHub Actions workflow by downloading the specific version of the Hyaline CLI from GitHub and adding it to the `PATH`.

After you have used this action, subsequent steps in the same job can run arbitrary `hyaline` commands using the standard GitHub Actions run syntax.

# Usage
This action can be run on `ubuntu-latest` and `macos-latest` (and should work on `windows-latest`) GitHub Actions runners. When running on self-hosted GitHub Actions runners you will need to install `NodeJS` using the version specified in [action.yml](./action.yml).

The default configuration installs a hard-coded version of Hyaline that is updated alongside major Hyaline releases:
```yaml
steps:
  - uses: appgardenstudios/hyaline-actions/setup@v1
```

A specific version of the Hyaline CLI can be installed using:
```yaml
steps:
  - uses: appgardenstudios/hyaline-actions/setup@v1
    with:
      version: "v1-YYYY-MM-DD-HASH"
```

# Inputs
The action supports the following inputs:

* `version` - (optional) The version of the Hyaline CLI to install. This version must be present as a tagged [GitHub Release](https://github.com/appgardenstudios/hyaline/releases) and must be later than `v1-2025-08-08`.

# Outputs
This action is not configured to provide any outputs.

# Developing

## Local Development
The action is contained in `index.js` and requires NodeJS v20. There is a test action configured to run that will exercise this action to install the CLI and run `hyaline version` when a push to anything other than the main branch is made.

## Releasing
Ensure that `npm run build` has been run and checked in alongside any `index.js` changes to the main branch. Once verified, tag the main branch and push that tag to GitHub (at least the main `vX` tag).