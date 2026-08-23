// Log Parser & Syntax Highlighter Utilities for Vercel Build Logs

export type LogLevel = 'all' | 'error' | 'warn' | 'info' | 'success';

export interface ParsedLogLine {
  id: string;
  index: number;
  time: string;
  rawText: string;
  cleanText: string;
  level: LogLevel;
}

// Regex to strip ANSI escape codes
const ANSI_REGEX = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

export function stripAnsi(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(ANSI_REGEX, '');
}

export function classifyLogLevel(text: string): LogLevel {
  const lower = text.toLowerCase();
  
  if (
    lower.includes('error') ||
    lower.includes('failed') ||
    lower.includes('err!') ||
    lower.includes('fatal') ||
    lower.includes('exception') ||
    lower.includes('exit status 1') ||
    lower.includes('command failed')
  ) {
    return 'error';
  }
  
  if (
    lower.includes('warn') ||
    lower.includes('warning') ||
    lower.includes('deprecated') ||
    lower.includes('caution')
  ) {
    return 'warn';
  }
  
  if (
    lower.includes('✓') ||
    lower.includes('success') ||
    lower.includes('successfully') ||
    lower.includes('compiled') ||
    lower.includes('ready in')
  ) {
    return 'success';
  }
  
  return 'info';
}

export function parseRawLogs(events: any[]): ParsedLogLine[] {
  return events.map((event, idx) => {
    const raw = event.payload?.text || event.text || (typeof event === 'string' ? event : JSON.stringify(event));
    const clean = stripAnsi(raw);
    const date = event.date || event.created || 0;
    const time = date
      ? new Date(date).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : '--:--:--';

    return {
      id: `${idx}-${date}`,
      index: idx + 1,
      time,
      rawText: raw,
      cleanText: clean,
      level: classifyLogLevel(clean),
    };
  });
}

// Mock logs generator for simulated builds or when no remote logs are available
export const MOCK_BUILD_LOGS: { text: string; delay: number }[] = [
  { text: 'Cloning github.com/user/project (Branch: main, Commit: 7f3a1b2)', delay: 200 },
  { text: 'Cloning completed: 842.12ms', delay: 500 },
  { text: 'Analyzing source code and project configuration...', delay: 800 },
  { text: 'Detected Next.js project (Version 15.1.0)', delay: 1100 },
  { text: 'Detected package manager: pnpm (v9.12.0)', delay: 1400 },
  { text: 'Running "pnpm install" --frozen-lockfile...', delay: 1800 },
  { text: 'Packages resolved: 428 in 1.4s', delay: 2400 },
  { text: 'Running "pnpm run build"...', delay: 3000 },
  { text: '▲ Next.js 15.1.0', delay: 3400 },
  { text: '  - Environments: .env.production.local, .env.production, .env', delay: 3700 },
  { text: '  - Experiments: turbo', delay: 3900 },
  { text: '✓ Compiled in 2.1s (1247 modules)', delay: 4800 },
  { text: '✓ Linting and type checking complete: 0 errors, 0 warnings', delay: 5600 },
  { text: '✓ Generating static pages (14/14)', delay: 6400 },
  { text: '✓ Collecting build traces', delay: 7000 },
  { text: 'Route (app)                              Size     First Load JS', delay: 7300 },
  { text: '┌ ○ /                                    5.4 kB         89.2 kB', delay: 7500 },
  { text: '├ ○ /_not-found                          872 B          84.6 kB', delay: 7600 },
  { text: '├ λ /api/auth                            142 B          83.9 kB', delay: 7700 },
  { text: '└ λ /api/deployments                     210 B          84.0 kB', delay: 7800 },
  { text: '+ First Load JS shared by all           83.8 kB', delay: 7900 },
  { text: 'λ (Serverless)  server-side renders at runtime', delay: 8100 },
  { text: '○ (Static)      prerendered as static content', delay: 8200 },
  { text: '✓ Build completed in 7.82s', delay: 8500 },
  { text: 'Uploading build outputs to Vercel Edge Network...', delay: 8900 },
  { text: '✓ Deployed to https://project-alpha.vercel.app', delay: 9400 },
];
