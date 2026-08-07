const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const stylesCss = fs.readFileSync(path.join(root, 'css', 'styles.css'), 'utf8');
const adminCss = fs.readFileSync(path.join(root, 'css', 'admin.css'), 'utf8');

// Find rules with fixed pixel widths >= 400px that are NOT media query expressions and NOT max-width
function findPotentialOverflows(cssText, fileName) {
  const lines = cssText.split('\n');
  const issues = [];
  let currentSelector = '';
  let inMediaQuery = false;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('@media')) {
      inMediaQuery = true;
    }
    if (trimmed.endsWith('{') && !trimmed.startsWith('@media')) {
      currentSelector = trimmed;
    }
    if (trimmed === '}' && inMediaQuery) {
      inMediaQuery = false;
    }

    // Match exact width: Npx (not max-width, not min-width)
    const match = trimmed.match(/^width:\s*([4-9]\d{2,}|[1-9]\d{3,})px/i);
    if (match) {
      issues.push({
        file: fileName,
        line: idx + 1,
        selector: currentSelector,
        rule: trimmed,
        val: match[1],
        inMediaQuery
      });
    }
  });

  return issues;
}

console.log('--- styles.css Fixed Widths ---');
console.log(JSON.stringify(findPotentialOverflows(stylesCss, 'styles.css'), null, 2));

console.log('--- admin.css Fixed Widths ---');
console.log(JSON.stringify(findPotentialOverflows(adminCss, 'admin.css'), null, 2));
