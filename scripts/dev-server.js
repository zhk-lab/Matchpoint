const fs = require('fs');
const path = require('path');
const { execSync, spawnSync, spawn } = require('child_process');

function readPort() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return 3000;

  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^PORT=(\d+)$/m);
  return match ? Number(match[1]) : 3000;
}

function getListeningPids(port) {
  if (process.platform === 'win32') {
    const output = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
    const pids = new Set();

    for (const line of output.split(/\r?\n/)) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 5) continue;
      const [protocol, localAddress, , state, pid] = parts;
      if (protocol !== 'TCP') continue;
      if (state !== 'LISTENING') continue;
      if (!localAddress.endsWith(`:${port}`)) continue;
      if (pid && pid !== '0') pids.add(Number(pid));
    }

    return [...pids];
  }

  const output = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' });
  return output
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item));
}

function getProcessLabel(pid) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`tasklist /FI "PID eq ${pid}"`, { encoding: 'utf8' });
      const line = output
        .split(/\r?\n/)
        .map((item) => item.trim())
        .find((item) => item.toLowerCase().startsWith('node.exe'));
      return line ?? `PID ${pid}`;
    }

    const output = execSync(`ps -p ${pid} -o comm=`, { encoding: 'utf8' }).trim();
    return output || `PID ${pid}`;
  } catch {
    return `PID ${pid}`;
  }
}

function printStatus(port, pids) {
  if (pids.length === 0) {
    console.log(`No dev server is listening on port ${port}.`);
    return;
  }

  console.log(`Port ${port} is currently in use by:`);
  for (const pid of pids) {
    console.log(`- ${getProcessLabel(pid)}`);
  }
}

function stopServer(port) {
  const pids = getListeningPids(port);
  if (pids.length === 0) {
    console.log(`No dev server is listening on port ${port}.`);
    return;
  }

  for (const pid of pids) {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/PID', String(pid), '/F'], { stdio: 'inherit' });
    } else {
      spawnSync('kill', ['-9', String(pid)], { stdio: 'inherit' });
    }
  }

  console.log(`Stopped process(es) on port ${port}.`);
}

function startClean() {
  const port = readPort();
  stopServer(port);

  const nestBin =
    process.platform === 'win32'
      ? path.join(process.cwd(), 'node_modules', '.bin', 'nest.cmd')
      : path.join(process.cwd(), 'node_modules', '.bin', 'nest');

  const child = spawn(nestBin, ['start', '--watch'], {
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  process.on('SIGINT', () => child.kill('SIGINT'));
  process.on('SIGTERM', () => child.kill('SIGTERM'));
}

const action = process.argv[2];
const port = readPort();

try {
  if (action === 'status') {
    printStatus(port, getListeningPids(port));
  } else if (action === 'stop') {
    stopServer(port);
  } else if (action === 'start-clean') {
    startClean();
  } else {
    console.error('Usage: node scripts/dev-server.js <status|stop|start-clean>');
    process.exit(1);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
