const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const projectRoot = path.resolve(__dirname, '../');

const inputFilePath = path.join(projectRoot, 'dist/tos_and_pp_plaintext');
const outputFilePath = path.join(projectRoot, 'dist/tos_policy_version');

if (!fs.existsSync(inputFilePath)) {
    console.error(`File does not exist: ${inputFilePath}`);
    process.exit(1);
}

const fileBuffer = fs.readFileSync(inputFilePath);

const hashSum = crypto.createHash('sha256');
hashSum.update(fileBuffer);
const hex = hashSum.digest('hex');

fs.writeFileSync(outputFilePath, hex);

console.log(`Hash updated: ${outputFilePath}`);
