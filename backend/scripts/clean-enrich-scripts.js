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

  const cleaned = content
    .replace(/100%\s*Pure\s*&\s*Natural/gi, 'Pure & Natural')
    .replace(/100%\s*Pure/gi, 'Pure')
    .replace(/100%\s*Natural/gi, 'Natural')
    .replace(/100%\s*Chemical\s*Free/gi, 'Chemical Free')
    .replace(/100%\s*Fresh/gi, 'Fresh')
    .replace(/100%\s*Quality/gi, 'Quality')
    .replace(/100%\s*Organic/gi, 'Organic')
    .replace(/100%\s*Heirloom/gi, 'Heirloom')
    .replace(/100%/g, '');

  fs.writeFileSync(filePath, cleaned, 'utf8');
  console.log(`✅ Cleaned script: ${file}`);
}

console.log('🎉 Cleaned all enrich-*.js seed scripts!');
