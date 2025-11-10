const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist/ng-tropicaliacraft-landing-page/browser');
const docsPath = path.join(__dirname, '../docs');

// Remove existing docs folder
if (fs.existsSync(docsPath)) {
  fs.rmSync(docsPath, { recursive: true, force: true });
  console.log('✓ Removed existing docs folder');
}

// Copy dist/browser to docs
if (fs.existsSync(distPath)) {
  fs.cpSync(distPath, docsPath, { recursive: true });
  console.log('✓ Copied build output to docs folder');
  
  // Create .nojekyll file for GitHub Pages
  fs.writeFileSync(path.join(docsPath, '.nojekyll'), '');
  console.log('✓ Created .nojekyll file');
  
  // Create 404.html (copy of index.html for SPA routing)
  const indexPath = path.join(docsPath, 'index.html');
  const notFoundPath = path.join(docsPath, '404.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('✓ Created 404.html for SPA routing');
  }
  
  console.log('\n✓ Static site generated successfully in /docs folder!');
  console.log('✓ Ready for GitHub Pages deployment');
} else {
  console.error('❌ Build output not found at:', distPath);
  console.error('   Run "ng build --configuration production" first');
  process.exit(1);
}
