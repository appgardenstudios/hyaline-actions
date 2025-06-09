const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

async function check () {
  try {
    // Get inputs
    const config = core.getInput('config');
    const system = core.getInput('system');
    const repository = core.getInput('repository');
    const pull_number = core.getInput('pull_number');
    const github_token = core.getInput('github_token');
    
    // Generate run UUID
    const uuid = crypto.randomUUID();
    console.log(`Using run UUID ${uuid}`);

    // Get owner and repo from inputs, falling back to context
    let [owner, repo] = repository.split('/');
    if (!owner || !repo) {
      [owner, repo] = github.context.repository.split('/');
    }
    console.log(`Checking PR ${owner}/${repo}/${pull_number} using system ${system} and config ${config}`);
    
    // Get HEAD/BASE for Pull Request
    const octokit = github.getOctokit(github_token);
    const { data: pullRequest } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number,
    });
    const head = pullRequest.head.ref;
    const sha = pullRequest.head.sha;
    const base = pullRequest.base.ref;
    console.log(`Using head: ${head}, base: ${base}`);

    // See if a Hyaline comment already exists
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: pull_number,
      per_page: 100, // TODO loop to get them all
    });
    const comment = comments.find((comment) => {
      return comment.body.startsWith('# H\u200By\u200Ba\u200Bl\u200Bi\u200Bn\u200Be');
    });
    const commentID = comment ? comment.id : undefined;
    console.log(`Using comment: ${commentID}`);

    // Run version
    console.log('Running hyaline version:');
    await exec.exec('hyaline', ['version']);

    // Run extract current
    console.log('Running hyaline extract current:');
    await exec.exec('hyaline', [
      '--debug', // TODO mark down to make debug optional
      'extract', 'current',
      '--config', config,
      '--system', system,
      '--output', `./current-${uuid}.db`,
    ]);

    // Run extract change
    console.log('Running hyaline extract change:');
    await exec.exec('hyaline', [
      '--debug',
      'extract', 'change',
      '--config', config,
      '--system', system,
      '--base', `origin/${base}`, // TODO Mark this down as something to be included in hyaline itself
      '--head', `origin/${head}`,
      '--output', `./change-${uuid}.db`,
    ]);

    // Run check change
    console.log('Running hyaline check change:');
    await exec.exec('hyaline', [
      '--debug',
      'check', 'change',
      '--config', config,
      '--system', system,
      '--current', `./current-${uuid}.db`,
      '--change', `./change-${uuid}.db`,
      '--output', `./recommendations-${uuid}.json`,
    ]);

    // Run update pr
    console.log('Running hyaline update pr:');
    const updatePR = [
      '--debug',
      'update', 'pr',
      '--config', config,
      '--pull-request', `${owner}/${repo}/${pull_number}`,
      '--sha', sha,
      '--recommendations', `./recommendations-${uuid}.json`,
      '--output', `./comment-${uuid}.json`,
    ];
    if (commentID) {
      updatePR.push('--comment', `${owner}/${repo}/${commentID}`);
    }
    await exec.exec('hyaline', updatePR);

    // Set outputs
    console.log('Setting Outputs:');
    const commentMetadataPath = path.join(process.cwd(), `./comment-${uuid}.json`);
    console.log(`Loading comment metadata from ${commentMetadataPath}`);
    const rawCommentMetadata = fs.readFileSync(commentMetadataPath, 'utf8');
    const commentMetadata = JSON.parse(rawCommentMetadata);
    let completed_recommendations = 0;
    let outstanding_recommendations = 0;
    let total_recommendations = commentMetadata.recommendations?.length || 0;
    commentMetadata.recommendations?.forEach(rec => {
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