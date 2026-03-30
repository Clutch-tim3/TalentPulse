import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

function fixImports(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const relativeImportRegex = /from\s*['"](\..*?)\.js['"]/g;
      let updatedContent = content.replace(relativeImportRegex, (match, importPath) => {
        return `from '${importPath}'`;
      });

      if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent);
        console.log(`Fixed imports in ${filePath}`);
      }
    }
  });
}

fixImports(srcDir);
console.log('Import fixing complete');
