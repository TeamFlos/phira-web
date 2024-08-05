const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const projectRoot = path.resolve(__dirname, '../');

const distDir = path.join(projectRoot, 'dist');
const outputFilePath = path.join(distDir, 'tos_policy_version');

const filePrefix = 'tos_and_pp_plaintext_';
const files = fs.readdirSync(distDir);
const targetFiles = files
    .filter(file => file.startsWith(filePrefix))
    .sort();

if (targetFiles.length === 0) {
    console.error('fild does not exist');
    process.exit(1);
}

let combinedContent = '';
targetFiles.forEach(file => {
    const filePath = path.join(distDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    combinedContent += fileContent;
});

const hashSum = crypto.createHash('sha256');
hashSum.update(combinedContent);
const hex = hashSum.digest('hex');

fs.writeFileSync(outputFilePath, hex);

console.log(`version updated: ${outputFilePath}`);
