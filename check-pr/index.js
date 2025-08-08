const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

async function check() {
  try {
    // Get inputs
    const config = core.getInput('config');
    const repository = core.getInput('repository');
    const pr_number = core.getInput('pr_number');
    const github_token = core.getInput('github_token');
    
    // Generate run UUID
    const uuid = crypto.randomUUID();
    console.log(`Using run UUID ${uuid}`);

    // Get owner and repo from inputs, falling back to context
    let [owner, repo] = repository.split('/');
    if (!owner || !repo) {
      [owner, repo] = github.context.repository.split('/');
    }
    console.log(`Checking PR ${owner}/${repo}/${pr_number} using system ${system} and config ${config}`);
    
    // Get HEAD/BASE for Pull Request
    const octokit = github.getOctokit(github_token);
    const { data: pullRequest } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pr_number,
    });
    const head = pullRequest.head.ref;
    const sha = pullRequest.head.sha;
    const base = pullRequest.base.ref;
    console.log(`Using head: ${head}, base: ${base}`);

    // Run version
    console.log('Running hyaline version:');
    await exec.exec('hyaline', ['version']);

    // Run extract documentation
    console.log('Running hyaline extract documentation:');
    let args = [
      'extract', 'documentation',
      '--config', config,
      '--output', `./documentation-${uuid}.db`,
    ];
    if (core.isDebug()) {
      args.unshift('--debug');
    }
    await exec.exec('hyaline', args);

    // Run check pr
    console.log('Running hyaline check pr:');
    args = [
      'check', 'pr',
      '--config', config,
      '--documentation', `./documentation-${uuid}.db`,
      '--pull-request', `${owner}/${repo}/${pr_number}`,
      '--output', `./recommendations-${uuid}.json`,
    ];
    if (core.isDebug()) {
      args.unshift('--debug');
    }
    await exec.exec('hyaline', args);

    // Set outputs
    console.log('Setting Outputs:');
    const recommendationsPath = path.join(process.cwd(), `./recommendations-${uuid}.json`);
    console.log(`Loading recommendations from ${recommendationsPath}`);
    const rawRecommendations = fs.readFileSync(recommendationsPath, 'utf8');
    const recommendations = JSON.parse(rawRecommendations);
    let completed_recommendations = 0;
    let outstanding_recommendations = 0;
    let total_recommendations = recommendations.recommendations?.length || 0;
    recommendations.recommendations?.forEach(rec => {
      if (rec.checked) {
        completed_recommendations++;
      } else {
        outstanding_recommendations++;
      }
    });
    console.log(`completed_recommendations: ${completed_recommendations}`);
    core.setOutput("completed_recommendations", completed_recommendations);
    console.log(`outstanding_recommendations: ${outstanding_recommendations}`);
    core.setOutput("outstanding_recommendations", outstanding_recommendations);
    console.log(`total_recommendations: ${total_recommendations}`);
    core.setOutput("total_recommendations", total_recommendations);

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