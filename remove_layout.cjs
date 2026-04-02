const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let originalContent = content;
            if (content.includes('import Layout')) {
                // Remove import
                content = content.replace(/^import\s+Layout\s+from\s+['"].*?Layout['"];?\r?\n/gm, '');
                // Replace <Layout> with <>
                content = content.replace(/<Layout\s*>/g, '<>');
                // Replace </Layout> with </>
                content = content.replace(/<\/Layout\s*>/g, '</>');
                
                if (content !== originalContent) {
                    fs.writeFileSync(fullPath, content);
                    console.log('Processed', fullPath);
                }
            }
        }
    }
}

processDir('c:\\Users\\sondk\\OneDrive\\Documents\\GitHub\\hotel project\\src\\pages');
