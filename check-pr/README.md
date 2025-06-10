# appgardenstudios/hyaline-actions/check-pr
The `appgardenstudios/hyaline-actions/check-pr` action is a JavaScript action that extracts and checks the change associated with a PR using [Hyaline](https://github.com/appgardenstudios/hyaline).

This PR runs the following hyaline commands:
* `hyaline version` to document which version was used
* `hyaline extract current` to extract the current data set for the system
* `hyaline extract change` to extract the change data set for the system based on the PR
* `hyaline check change` to check the change for needed documentation updates
* `hyaline update pr` to comment on the PR with the results of the check

# Usage
This action can be run on `ubuntu-latest` and `macos-latest` (and should work on `windows-latest`) GitHub Actions runners. When running on self-hosted GitHub Actions runners you will need to install `NodeJS` using the version specified in [action.yml](./action.yml).

The following example shows a standard configuration that uses hyaline to check non-draft PRs:
```yaml
on:
  pull_request:
    types: [opened, reopened, synchronize, ready_for_review]

jobs:
  check-pr:
    runs-on: ubuntu-latest
    # Only run if PR is NOT a draft
    if: ${{ github.event.pull_request.draft == false }}
    permissions:
      issues: write
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Setup Hyaline
        uses: appgardenstudios/hyaline-actions/setup@v0
      - name: Check PR
        uses: appgardenstudios/hyaline-actions/check-pr@v0
        with:
          config: ./hyaline.yml
          system: my-app
          repository: ${{ github.repository }}
          pr_number: ${{ github.event.pull_request.number }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
        env:
          # Set env vars needed by the hyaline CLI when interpolating the hyaline config
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ANTHROPIC_KEY: ${{ secrets.ANTHROPIC_KEY }}
```

Note that `check-pr` requires permission to leave a comment on the pull request, and since pull requests are treated as issues by GitHub, Hyaline required the permission `issues: write` to add/update the comment on the pull request.

# Inputs
The action supports the following inputs:

* `config` - (required) The path to the hyaline configuration file relative to the root of the repository.
* `system` - (required) The system to use when extracting and checking the change.
* `repository`  - (optional) The current GitHub repository (owner/repo).
* `pr_number` - (required) The pull request number.
* `github_token` - (required) The GitHub token to use when reading and updating the PR's comments. This must have read/write to the repositories issues (because a pull request comment is actually an issue comment in GitHub).

# Outputs
This action provides the following outputs:

* `completed_recommendations` - The number of recommendations that have been checked and marked as completed.
* `outstanding_recommendations` - The number of recommendations that are unchecked and not marked as completed.
* `total_recommendations` - The total number of recommendations (sum of `completed_recommendations` and `outstanding_recommendations`)


# Developing

## Local Development
The action is contained in `index.js` and requires NodeJS v20.

## Releasing
Ensure that `npm run build` has been run and checked in alongside any `index.js` changes to the main branch. Once verified, tag the main branch and push that tag to GitHub (at least the main `vX` tag).