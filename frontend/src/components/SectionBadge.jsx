import React from 'react';
import { 
  FiShield, 
  FiAward, 
  FiHeart, 
  FiPackage, 
  FiUsers, 
  FiHelpCircle, 
  FiMail, 
  FiMapPin, 
  FiBookOpen, 
  FiZap,
  FiLock,
  FiShoppingBag,
  FiTruck,
  FiCheckCircle
} from 'react-icons/fi';
import { GiSprout, GiSun } from 'react-icons/gi';

/**
 * Premium Section Badge (Eyebrow Heading Label)
 * Specs:
 * - Soft rounded pill shape (rounded-full)
 * - Light olive background (#F0F5E6)
 * - Thin green border (#4E641A 20% opacity)
 * - Premium uppercase typography (11-13px, font-bold 700, tracking-widest)
 * - Padding: py-1.5 px-4 (6-8px vertical, 14-18px horizontal)
 * - Inline-flex / w-fit (fits content only)
 * - Clean icon matching section context
 */
export default function SectionBadge({ 
  text, 
  icon: CustomIcon, 
  align = 'left',
  className = '' 
}) {
  if (!text) return null;

  // Auto-detect icon based on text if custom icon is not explicitly passed
  let IconComponent = CustomIcon;

  if (!IconComponent) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('nature') || lowerText.includes('sprout') || lowerText.includes('superfood') || lowerText.includes('standard') || lowerText.includes('harvest') || lowerText.includes('staple') || lowerText.includes('pure')) {
      IconComponent = GiSprout;
    } else if (lowerText.includes('trust') || lowerText.includes('shield') || lowerText.includes('integrity') || lowerText.includes('guarantee') || lowerText.includes('security') || lowerText.includes('privacy') || lowerText.includes('legal') || lowerText.includes('policy')) {
      IconComponent = FiShield;
    } else if (lowerText.includes('quality') || lowerText.includes('award') || lowerText.includes('excellence') || lowerText.includes('pillar') || lowerText.includes('premium') || lowerText.includes('commitment')) {
      IconComponent = FiAward;
    } else if (lowerText.includes('science') || lowerText.includes('nutrition') || lowerText.includes('health') || lowerText.includes('wellness') || lowerText.includes('targeted') || lowerText.includes('care')) {
      IconComponent = FiHeart;
    } else if (lowerText.includes('journey') || lowerText.includes('together') || lowerText.includes('story') || lowerText.includes('forward') || lowerText.includes('partner') || lowerText.includes('join') || lowerText.includes('collaboration')) {
      IconComponent = FiUsers;
    } else if (lowerText.includes('answer') || lowerText.includes('faq') || lowerText.includes('help') || lowerText.includes('support') || lowerText.includes('question')) {
      IconComponent = FiHelpCircle;
    } else if (lowerText.includes('contact') || lowerText.includes('thought') || lowerText.includes('message') || lowerText.includes('response') || lowerText.includes('reach') || lowerText.includes('timely')) {
      IconComponent = FiMail;
    } else if (lowerText.includes('application') || lowerText.includes('portal') || lowerText.includes('form') || lowerText.includes('apply')) {
      IconComponent = FiBookOpen;
    } else if (lowerText.includes('location') || lowerText.includes('address') || lowerText.includes('coordinate') || lowerText.includes('delivery')) {
      IconComponent = FiMapPin;
    } else if (lowerText.includes('product') || lowerText.includes('range') || lowerText.includes('catalog') || lowerText.includes('collection') || lowerText.includes('shop') || lowerText.includes('order')) {
      IconComponent = FiPackage;
    } else if (lowerText.includes('fast') || lowerText.includes('spark') || lowerText.includes('special') || lowerText.includes('featured')) {
      IconComponent = FiZap;
    } else {
      IconComponent = GiSun;
    }
  }

  const alignClass = align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : 'mr-auto';

  return (
    <div className={`inline-flex items-center gap-2 bg-[#F0F5E6] border border-[#4E641A]/20 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest text-[#2F3B0C] uppercase shadow-2xs transition-all duration-300 w-fit ${alignClass} ${className}`}>
      {IconComponent && <IconComponent className="w-3.5 h-3.5 text-[#4E641A] shrink-0" />}
      <span>{text}</span>
    </div>
  );
}
