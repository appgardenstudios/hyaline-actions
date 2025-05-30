const core = require('@actions/core');
const github = require('@actions/github');

async function check () {
  try {
    // Get inputs
    const config = core.getInput('config');
    const repository = core.getInput('repository');
    const pull_number = core.getInput('pull_number');
    const github_token = core.getInput('github_token');
    
    // Get owner and repo from inputs, falling back to context
    let [owner, repo] = repository.split('/');
    if (!owner || !repo) {
      [owner, repo] = github.context.repository.split('/');
    }
    console.log(`Checking PR ${owner}/${repo}/${pull_number} using config ${config}`);
    
    // Get HEAD/BASE for Pull Request
    const octokit = github.getOctokit(github_token);
    const { data: pullRequest } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number,
    });
    const head = pullRequest.head.ref;
    const base = pullRequest.head.base;
    console.log(`Using head: ${head}, base: ${base}`);

    // See if a Hyaline comment already exists
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: pull_number,
      per_page: 100, // TODO loop to get them all
    });
    let commentID = comments.find((comment) => {
      return comment.body.startsWith('# H\u200By\u200Ba\u200Bl\u200Bi\u200Bn\u200Be');
    });
    console.log(`Using comment: ${commentID}`);

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