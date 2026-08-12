const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const binDir = path.join(root, 'assets', 'bin');
const ffmpeg = path.join(binDir, 'ffmpeg.exe');
const ffprobe = path.join(binDir, 'ffprobe.exe');
const zip = path.join(binDir, 'ffmpeg-win64.zip');
const extractDir = path.join(binDir, '_ffmpeg_extract');

const FFMPEG_URLS = [
  'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip',
  'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip'
];

if (process.platform !== 'win32') {
  console.log('[prepare:win-runtime] Non-Windows host; skipping Windows FFmpeg preparation.');
  process.exit(0);
}

if (fs.existsSync(ffmpeg) && fs.existsSync(ffprobe)) {
  console.log('[prepare:win-runtime] FFmpeg runtime already present.');
  process.exit(0);
}

fs.mkdirSync(binDir, { recursive: true });

function download(url, destination, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 8) return reject(new Error('Too many redirects while downloading FFmpeg.'));

    const request = https.get(url, {
      headers: {
        'User-Agent': 'Ytomp34[210]/1.2.1',
        Accept: 'application/octet-stream'
      },
      timeout: 120000
    }, response => {
      const status = response.statusCode || 0;
      if (status >= 300 && status < 400 && response.headers.location) {
        response.resume();
        const next = new URL(response.headers.location, url).toString();
        return download(next, destination, redirects + 1).then(resolve, reject);
      }

      if (status !== 200) {
        response.resume();
        return reject(new Error(`HTTP ${status} from ${url}`));
      }

      const file = fs.createWriteStream(destination);
      let bytes = 0;
      response.on('data', chunk => { bytes += chunk.length; });
      response.on('error', reject);
      file.on('error', reject);
      file.on('finish', () => file.close(() => {
        if (bytes < 1024 * 1024) return reject(new Error(`Downloaded file is unexpectedly small (${bytes} bytes).`));
        resolve();
      }));
      response.pipe(file);
    });

    request.on('timeout', () => request.destroy(new Error('FFmpeg download timed out.')));
    request.on('error', reject);
  });
}

function runPowerShell(command) {
  const result = spawnSync('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy',
    'Bypass',
    '-Command',
    command
  ], { cwd: root, stdio: 'inherit', windowsHide: false });

  if (result.status !== 0) {
    throw new Error(`PowerShell command failed with exit code ${result.status ?? 'unknown'}.`);
  }
}

(async () => {
  let lastError = null;

  for (const url of FFMPEG_URLS) {
    try {
      if (fs.existsSync(zip)) fs.rmSync(zip, { force: true });
      console.log(`[prepare:win-runtime] Downloading FFmpeg from ${url}`);
      await download(url, zip);
      lastError = null;
      break;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`[prepare:win-runtime] Download failed: ${lastError.message}`);
    }
  }

  if (lastError) throw lastError;

  if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
  fs.mkdirSync(extractDir, { recursive: true });

  console.log('[prepare:win-runtime] Extracting FFmpeg...');
  runPowerShell(`Expand-Archive -LiteralPath '${zip.replace(/'/g, "''")}' -DestinationPath '${extractDir.replace(/'/g, "''")}' -Force`);

  const entries = fs.readdirSync(extractDir, { withFileTypes: true });
  const rootDir = entries.find(entry => entry.isDirectory())?.name;
  if (!rootDir) throw new Error('FFmpeg archive did not contain an extracted directory.');

  const sourceBin = path.join(extractDir, rootDir, 'bin');
  for (const name of ['ffmpeg.exe', 'ffprobe.exe']) {
    const source = path.join(sourceBin, name);
    if (!fs.existsSync(source)) throw new Error(`FFmpeg archive is missing ${name}.`);
    fs.copyFileSync(source, path.join(binDir, name));
  }

  fs.rmSync(extractDir, { recursive: true, force: true });
  fs.rmSync(zip, { force: true });

  if (!fs.existsSync(ffmpeg) || !fs.existsSync(ffprobe)) {
    throw new Error('FFmpeg preparation completed without both binaries.');
  }

  const verify = spawnSync(ffmpeg, ['-version'], { cwd: root, encoding: 'utf8', windowsHide: true });
  if (verify.status !== 0) throw new Error('Bundled ffmpeg.exe failed its startup check.');

  console.log('[prepare:win-runtime] FFmpeg ready:', binDir);
})().catch(error => {
  console.error('[prepare:win-runtime] FFmpeg preparation failed:', error.message);
  process.exit(1);
});
