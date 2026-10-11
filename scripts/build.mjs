import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import less from 'less';

process.chdir(fileURLToPath(new URL('..', import.meta.url)));
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'js', 'icon', 'tiles']) {
  await cp(file, `dist/${file}`, { recursive: true });
}
for (const dir of ['php', 'statistics', 'geodata', 'css', 'assets']) {
  await mkdir(`dist/${dir}`, { recursive: true });
}
for (const file of ['log.php', 'statistics.php']) await cp(`php/${file}`, `dist/php/${file}`);
for (const file of ['index.html', 'statistics.js', 'cities.json']) {
  await cp(`statistics/${file}`, `dist/statistics/${file}`);
}
for (const file of await readdir('geodata')) {
  if (file.endsWith('.json')) await cp(`geodata/${file}`, `dist/geodata/${file}`);
}
const css = await less.render(await readFile('css/quizzity.less', 'utf8'), {
  filename: path.resolve('css/quizzity.less'), math: 'always'
});
await writeFile('dist/css/quizzity.css', css.css);
const packages = JSON.parse(await readFile('package.json', 'utf8')).dependencies;
for (const name of Object.keys(packages)) {
  const source = `node_modules/${name}`;
  await mkdir(`dist/assets/${name}`, { recursive: true });
  const files = name === 'lodash' ? ['lodash.min.js'] : name === 'animate.css' ? ['animate.min.css'] : name === 'font-awesome' ? ['css', 'fonts'] : ['dist'];
  for (const file of files) await cp(`${source}/${file}`, `dist/assets/${name}/${file}`, { recursive: true });
  for (const file of await readdir(source)) {
    if (/^(licen[sc]e|copying|copyright|ofl)(\.|$|-)/i.test(file)) {
      await cp(`${source}/${file}`, `dist/assets/${name}/${file}`, { recursive: true });
    }
  }
}
