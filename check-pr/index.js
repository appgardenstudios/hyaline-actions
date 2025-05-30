const core = require('@actions/core');

async function check () {
  try {
    // Get inputs
    // TODO
    console.log("Hello World!");

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