const fs = require('fs');
const path = require('path');

const rootPackage = require('../package.json');
const deps = { ...rootPackage.dependencies, ...rootPackage.devDependencies };
const packages = Object.keys(deps).sort().map(name => {
  try {
    const pkgPath = require.resolve(path.join(name, 'package.json'), { paths: [path.join(__dirname, '..', 'node_modules')] });
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const author = typeof pkg.author === 'string' ? pkg.author : pkg.author?.name || '';
    return { name, version: pkg.version || deps[name], author, license: pkg.license || '' };
  } catch (err) {
    return { name, version: deps[name], author: '', license: '' };
  }
});

const outputDir = path.join(__dirname, '..', 'apps', 'servicebus-browser-frontend', 'src', 'assets');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
fs.writeFileSync(path.join(outputDir, 'packages.json'), JSON.stringify(packages, null, 2));
fs.writeFileSync(
  path.join(outputDir, 'app-info.json'),
  JSON.stringify({ version: rootPackage.version, author: rootPackage.author }, null, 2)
);
