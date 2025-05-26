const core = require('@actions/core');
const io = require('@actions/io');
const os = require('os');
const path = require('path');
const tc = require('@actions/tool-cache');

// https://nodejs.org/api/os.html#os_os_platform
function mapOperatingSystem(platform) {
  const mappings = {
    win32: 'windows'
  };
  return mappings[platform] || platform;
}

// https://nodejs.org/api/os.html#os_os_arch
function mapArchitecture(arch) {
  const mappings = {
    x32: '386',
    x64: 'amd64'
  };
  return mappings[arch] || arch;
}

async function setup () {
  try {
    // Get input(s)
    const version = core.getInput('version');
    core.debug(`Version: ${version}`);

    // Get OS/ARCH details
    const operatingSystem = mapOperatingSystem(os.platform());
    const architecture = mapArchitecture(os.arch());

    // Calculate the binary name and url to download
    let binaryName = `hyaline-${operatingSystem}-${architecture}`;
    core.debug(`Binary Name: ${binaryName}`);
    const url = `https://github.com/appgardenstudios/hyaline/releases/download/${version}/${binaryName}.zip`
    
    // Download requested version
    core.debug(`Downloading ${url}`);
    const pathToCLIZip = await tc.downloadTool(url);
    core.debug(`Downloaded to ${pathToCLIZip}`);

    // Unzip the file
    const pathToCLI = await tc.extractZip(pathToCLIZip)

    // Add to path
    core.debug(`Adding ${pathToCLI} to PATH`);
    core.addPath(pathToCLI);
  } catch (error) {
    core.error(error);
    throw error;
  }
}

(async () => {
  try {
    await setup();
  } catch (error) {
    core.setFailed(error.message);
  }
})();