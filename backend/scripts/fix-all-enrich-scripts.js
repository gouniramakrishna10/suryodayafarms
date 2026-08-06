import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '..');

const files = fs.readdirSync(backendDir).filter(f => f.startsWith('enrich-') && f.endsWith('.js'));

for (const file of files) {
  const filePath = path.join(backendDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  let cleaned = content
    .replace(/100%\s*Pure\s*&\s*Natural/gi, 'Pure & Natural')
    .replace(/100%\s*Pure\s*Natural/gi, 'Pure & Natural')
    .replace(/100%\s*Pure/gi, 'Pure')
    .replace(/100%\s*Natural/gi, 'Pure Natural')
    .replace(/100%\s*Organic/gi, 'Pure Organic')
    .replace(/100%\s*Chemical\s*Free/gi, 'Chemical Free')
    .replace(/100%\s*Fresh/gi, 'Fresh')
    .replace(/100%\s*Quality/gi, 'Quality')
    .replace(/100%\s*Heirloom/gi, 'Heirloom')
    .replace(/100%\s*bananas\b/gi, 'pure bananas')
    .replace(/100%\s*banana\b/gi, 'Pure Banana')
    .replace(/100%\s*moringa\b/gi, 'Pure Moringa')
    .replace(/100%\s*amla\b/gi, 'Pure Amla')
    .replace(/100%\s*wheatgrass\b/gi, 'Pure Wheatgrass')
    .replace(/100%\s*sprouted\s*ragi\b/gi, 'Pure Sprouted Ragi')
    .replace(/100%\s*/gi, 'Pure ')
    .replace(/Is this made from\s+([a-z\s]+)\?/gi, 'Is this made from pure $1?')
    .replace(/contains only\s+([A-Za-z\s]+)\./gi, 'contains only Pure $1.')
    .replace(/\s{2,}/g, ' ')
    .replace(/Pure\s+Pure/gi, 'Pure');

  // Fix botanical names in brackets to italicized (*Name*)
  cleaned = cleaned.replace(/\(([A-Z][a-z]+(?:\s+(?:[a-z]+|spp\.|sp\.))?)\)/g, (match, p1) => {
    if (p1.startsWith('*') && p1.endsWith('*')) return match;
    return `(*${p1}*)`;
  });

  fs.writeFileSync(filePath, cleaned, 'utf8');
  console.log(`✅ Fixed enrich script: ${file}`);
}

console.log('🎉 Fixed all 11 enrich scripts!');
