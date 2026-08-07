export const stripHtml = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

export const cleanText = (str) => {
  if (!str || typeof str !== 'string') return str;
  let s = str;

  // 1. Scientific names with markdown asterisks inside parentheses: (*Musa spp.*) -> (<em>Musa spp.</em>)
  s = s.replace(/\(\s*\*+\s*([^*]+?)\s*\*+\s*\)/g, '(<em>$1</em>)');

  // 2. Scientific names inside parentheses without formatting: (Musa spp.) -> (<em>Musa spp.</em>)
  s = s.replace(/\(\s*(?!(?:<em>|<strong>|<b>|<i>|https?:|http:))([A-Z][a-z]+(?:\s+(?:spp\.|subsp\.|var\.|[a-z]+))+)\s*\)/g, '(<em>$1</em>)');

  // 3. Standalone markdown italics *text* -> <em>text</em>
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  return s
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
    .replace(/100%\s*banana\b/gi, 'pure banana')
    .replace(/100%\s*moringa\b/gi, 'pure moringa')
    .replace(/100%\s*amla\b/gi, 'pure amla')
    .replace(/100%\s*wheatgrass\b/gi, 'pure wheatgrass')
    .replace(/100%\s*sprouted\s*ragi\b/gi, 'pure sprouted ragi')
    .replace(/100%\s*coriander\b/gi, 'pure coriander')
    .replace(/100%\s*curry\b/gi, 'pure curry')
    .replace(/100%\s*mint\b/gi, 'pure mint')
    .replace(/100%\s*spinach\b/gi, 'pure spinach')
    .replace(/100%\s*beetroot\b/gi, 'pure beetroot')
    .replace(/100%\s*carrot\b/gi, 'pure carrot')
    .replace(/100%\s*/gi, 'Pure ')
    .replace(/\b100%\b/g, 'Pure')
    .replace(/Pure\s+Pure/gi, 'Pure')
    .replace(/\bThe\s+Suryodaya\s+Difference\b/gi, 'The Suryodaya Farms Difference')
    .replace(/\bSuryodaya\s+Difference\b/gi, 'Suryodaya Farms Difference')
    .replace(/Suryodaya\s+Farms\s+Farms\s+Difference/gi, 'Suryodaya Farms Difference')
    .replace(/Pure Nature\.\s*Scientific Quality\.\s*Trusted Nutrition\./gi, 'Pure Nature | Scientific Quality | Trusted Nutrition')
    .replace(/Pure Ingredients\.\s*Scientific Standards\.\s*Trusted Nutrition\./gi, 'Pure Ingredients | Scientific Standards | Trusted Nutrition')
    .replace(/Nature's Goodness\.\s*Guided by Science\./gi, "Nature's Goodness | Guided by Science")
    .replace(/Nurtured by Nature\.\s*Perfected by Science\./gi, 'Nurtured by Nature | Perfected by Science')
    .replace(/\s*•\s*/g, ' | ')
    .replace(/<strong>\s*/gi, '<strong>')
    .replace(/\s*<\/strong>/gi, '</strong>');
};
