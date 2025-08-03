const fs = require('fs');
const path = require('path');

const rootPackage = require('../package.json');
const deps = { ...rootPackage.dependencies, ...rootPackage.devDependencies };
const packages = Object.keys(deps).sort().map(name => {
  try {
    const pkgPath = require.resolve(path.join(name, 'package.json'), { paths: [path.join(__dirname, '..', 'node_modules')] });
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const author = typeof pkg.author === 'string' ? pkg.author : pkg.author?.name || '';
    const homepage = pkg.homepage || pkg.repository?.url || '';
    return { name, version: pkg.version || deps[name], author, license: pkg.license || '', homepage };
  } catch (err) {
    return { name, version: deps[name], author: '', license: '' };
  }
});

const outputDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
fs.writeFileSync(path.join(outputDir, 'packages.json'), JSON.stringify(packages, null, 2));
fs.writeFileSync(
  path.join(outputDir, 'app-info.json'),
  JSON.stringify({
    version: process.env.TAG_VERSION ?? '0.0.0',
    author: rootPackage.author,
    homepage: rootPackage.homepage || rootPackage.repository?.url || ''
  }, null, 2)
);

const constantsPath = 'apps/servicebus-browser-app/src/app/constants.ts';
const version = process.env.TAG_VERSION ?? '0.0.0';
const content = fs.readFileSync(constantsPath, 'utf8');
const updated = content.replace(/export const currentVersion = '.*';/, `export const currentVersion = '${version}';`);
fs.writeFileSync(constantsPath, updated);
