import { mkdir, readFile, rm, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'terser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

async function ensureCleanDist() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
}

function rewriteContent(source, replacements) {
  return replacements.reduce((content, [from, to]) => content.replaceAll(from, to), source);
}

async function buildStaticPage(options) {
  const htmlSource = await readFile(path.join(rootDir, options.html.from), 'utf8');
  const rewrittenHtml = rewriteContent(htmlSource, options.html.replacements);

  await writeFile(path.join(distDir, options.html.to), rewrittenHtml, 'utf8');
  await copyFile(path.join(rootDir, options.css.from), path.join(distDir, options.css.to));
  await copyFile(path.join(rootDir, options.js.from), path.join(distDir, options.js.to));
}

async function buildReadableAssets() {
  await Promise.all([
    buildStaticPage({
      html: {
        from: 'docs/index.html',
        to: 'index.html',
        replacements: [
          ['./styles.css', './docs.css'],
          ['./app.js', './docs.js'],
          ['../demo/index.html', './demo.html'],
          ['../MeetingSpeak.js', './MeetingSpeak.js']
        ]
      },
      css: {
        from: 'docs/styles.css',
        to: 'docs.css'
      },
      js: {
        from: 'docs/app.js',
        to: 'docs.js'
      }
    }),
    buildStaticPage({
      html: {
        from: 'demo/index.html',
        to: 'demo.html',
        replacements: [
          ['./styles.css', './demo.css'],
          ['./app.js', './demo.js'],
          ['../docs/index.html', './index.html'],
          ['../MeetingSpeak.js', './MeetingSpeak.js']
        ]
      },
      css: {
        from: 'demo/styles.css',
        to: 'demo.css'
      },
      js: {
        from: 'demo/app.js',
        to: 'demo.js'
      }
    })
  ]);
}

async function buildRuntime() {
  const sourcePath = path.join(rootDir, 'MeetingSpeak.js');
  const outputPath = path.join(distDir, 'MeetingSpeak.js');
  const source = await readFile(sourcePath, 'utf8');
  const result = await minify(source, {
    compress: true,
    mangle: true,
    format: {
      comments: false
    }
  });

  if (!result.code) {
    throw new Error('Build failed: terser did not return output.');
  }

  await writeFile(outputPath, result.code, 'utf8');
}

async function main() {
  await ensureCleanDist();
  await buildReadableAssets();
  await buildRuntime();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
