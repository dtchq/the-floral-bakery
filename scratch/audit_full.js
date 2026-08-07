const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
console.log('Running Deep Site & Admin Audit from root:', root);

const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

const auditResults = {
  htmlFilesChecked: htmlFiles.length,
  missingFiles: [],
  brokenLinks: [],
  layoutRootIssues: [],
  adminChecks: [],
  dataSchemaChecks: [],
  cssAudits: []
};

// 1. Audit HTML links & references
htmlFiles.forEach(file => {
  const filePath = path.join(root, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Script tags
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    const src = match[1];
    if (!src.startsWith('http')) {
      const fullPath = path.join(root, src.split('?')[0]);
      if (!fs.existsSync(fullPath)) {
        auditResults.missingFiles.push({ file, type: 'script', target: src });
      }
    }
  }

  // Link stylesheet tags
  const linkRegex = /<link[^>]+href=["']([^"']+)["']/gi;
  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[1];
    if (!href.startsWith('http') && !href.startsWith('data:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      const fullPath = path.join(root, href.split('?')[0].split('#')[0]);
      if (href !== '' && !fs.existsSync(fullPath)) {
        auditResults.missingFiles.push({ file, type: 'stylesheet/link', target: href });
      }
    }
  }

  // Images
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  while ((match = imgRegex.exec(content)) !== null) {
    const src = match[1];
    if (!src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('${')) {
      const fullPath = path.join(root, src.split('?')[0]);
      if (!fs.existsSync(fullPath)) {
        auditResults.missingFiles.push({ file, type: 'image', target: src });
      }
    }
  }

  // Anchors
  const aRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  while ((match = aRegex.exec(content)) !== null) {
    const href = match[1];
    if (href.startsWith('#') || href.startsWith('javascript:')) continue;
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (href.startsWith('${')) continue;
    const targetFile = href.split('?')[0].split('#')[0];
    if (targetFile) {
      const fullPath = path.join(root, targetFile);
      if (!fs.existsSync(fullPath)) {
        auditResults.brokenLinks.push({ file, href, targetFile });
      }
    }
  }

  // Universal Layout Roots
  if (file !== 'admin.html' && file !== 'logo-preview.html') {
    const roots = {
      header: content.includes('id="siteHeaderRoot"'),
      mobileDrawer: content.includes('id="mobileDrawerRoot"'),
      cartDrawer: content.includes('id="cartDrawerRoot"'),
      footer: content.includes('id="siteFooterRoot"'),
      layoutScript: content.includes('site-layout.js'),
      storeDataScript: content.includes('store-data.js')
    };
    for (const [key, val] of Object.entries(roots)) {
      if (!val) {
        auditResults.layoutRootIssues.push({ file, missingRoot: key });
      }
    }
  }
});

// 2. Audit Admin Panel DOM vs JS bindings
const adminHtmlPath = path.join(root, 'admin.html');
const adminJsPath = path.join(root, 'js', 'admin.js');

if (fs.existsSync(adminHtmlPath) && fs.existsSync(adminJsPath)) {
  const adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');
  const adminJs = fs.readFileSync(adminJsPath, 'utf8');

  // Check getElementById calls in admin.js
  const getByIdRegex = /document\.getElementById\(["']([^"']+)["']\)/g;
  const queriedIds = new Set();
  while ((match = getByIdRegex.exec(adminJs)) !== null) {
    queriedIds.add(match[1]);
  }

  const missingAdminIds = [];
  queriedIds.forEach(id => {
    // Check if ID exists in adminHtml or is dynamically generated
    const idPattern = new RegExp(`id=["']${id}["']`, 'i');
    if (!idPattern.test(adminHtml)) {
      missingAdminIds.push(id);
    }
  });

  auditResults.adminChecks.push({
    totalQueriedIdsInAdminJs: queriedIds.size,
    missingInAdminHtml: missingAdminIds
  });
}

// 3. Audit FloraDB methods referenced across all JS
const jsFiles = fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js'));
const storeDataContent = fs.readFileSync(path.join(root, 'js', 'store-data.js'), 'utf8');

jsFiles.forEach(jsFile => {
  if (jsFile === 'store-data.js') return;
  const jsContent = fs.readFileSync(path.join(root, 'js', jsFile), 'utf8');
  const floraMethodRegex = /FloraDB\.([a-zA-Z0-9_]+)\(/g;
  const calledMethods = new Set();
  while ((match = floraMethodRegex.exec(jsContent)) !== null) {
    calledMethods.add(match[1]);
  }

  const undefinedMethods = [];
  calledMethods.forEach(method => {
    // Check if defined in FloraDB
    const methodDefRegex = new RegExp(`${method}\\s*[:=]|${method}\\s*\\(`, 'g');
    if (!methodDefRegex.test(storeDataContent)) {
      undefinedMethods.push(method);
    }
  });

  if (undefinedMethods.length > 0) {
    auditResults.dataSchemaChecks.push({ file: jsFile, undefinedMethods });
  }
});

// 4. Audit CSS for fixed pixel widths that break mobile viewports
const stylesCss = fs.readFileSync(path.join(root, 'css', 'styles.css'), 'utf8');
const adminCss = fs.readFileSync(path.join(root, 'css', 'admin.css'), 'utf8');

const fixedWidthRegex = /width:\s*([6-9]\d{2,}|[1-9]\d{3,})px/g;
let cssMatch;
const fixedWidthsFound = [];
while ((cssMatch = fixedWidthRegex.exec(stylesCss)) !== null) {
  fixedWidthsFound.push(cssMatch[0]);
}

auditResults.cssAudits.push({
  stylesCssLargeFixedWidths: [...new Set(fixedWidthsFound)]
});

console.log(JSON.stringify(auditResults, null, 2));
