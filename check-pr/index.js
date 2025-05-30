const core = require('@actions/core');

async function check () {
  try {
    // Get inputs
    const config = core.getInput('config');
    const repository = core.getInput('repository');
    const pull_number = core.getInput('pull_number');
    const github_token = core.getInput('github_token');
    // TODO
    console.log(config, repository, pull_number);

    // Get HEAD/BASE for Pull Request
    // TODO

    // See if a Hyaline comment already exists
    // TODO

    // Run extract current
    // TODO

    // Run extract change
    // TODO

    // Run check change
    // TODO

    // Run update pr
    // TODO

    // Set outputs
    // TODO

  } catch (error) {
    core.error(error);
    throw error;
  }
}

(async () => {
  try {
    await check();
  } catch (error) {
    core.setFailed(error.message);
  }
})();