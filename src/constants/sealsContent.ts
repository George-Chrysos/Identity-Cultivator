/**
 * Seals Content Dictionary
 * Complete descriptions, tips, and focus guidance for each sub-pillar
 */

export interface SubPillarContent {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  focus: string;
  tips?: string;
}

export interface SealContent {
  id: string;
  name: string;
  subPillars: SubPillarContent[];
}

export const SEALS_CONTENT: SealContent[] = [
  {
    id: 'seal-shen',
    name: 'The Shen Seal',
    subPillars: [
      {
        id: 'shen-1',
        name: 'Soft Eyes',
        shortDescription: 'Expand peripheral vision to absorb the world rather than piercing it.',
        longDescription: 'Focus on the edges of your vision (walls, floor, ceiling) simultaneously. When walking, do not look at specific faces or objects; look at the space *between* them. This stops energy leakage through the eyes.',
        focus: 'Focus on the edges of your vision (walls, floor, ceiling) simultaneously. When walking, do not look at specific faces or objects; look at the space *between* them. This stops energy leakage through the eyes.',
      },
      {
        id: 'shen-2',
        name: 'The Cockpit',
        shortDescription: 'Anchor your perception inside your body, avoiding 3rd-person fantasies.',
        longDescription: 'You are the pilot, not the camera. Whenever you catch yourself watching a "movie" of yourself in your head, physically wiggle your toes to snap back to the First Person view. Anchor your attention in your hands or feet.',
        focus: 'You are the pilot, not the camera. Whenever you catch yourself watching a "movie" of yourself in your head, physically wiggle your toes to snap back to the First Person view. Anchor your attention in your hands or feet.',
      },
      {
        id: 'shen-3',
        name: 'The Silent Blade',
        shortDescription: 'Speak 50% less. Avoid unnecessary explanations and debates.',
        longDescription: 'Words are breath, and breath is Qi. Before answering a question, take one full breath. If the answer is not essential, offer silence or a simple nod. Conserve your fuel.',
        focus: 'Words are breath, and breath is Qi. Before answering a question, take one full breath. If the answer is not essential, offer silence or a simple nod. Conserve your fuel.',
      },
      {
        id: 'shen-4',
        name: 'One Cut',
        shortDescription: 'Single-task focus. Do not multitask or scroll while working.',
        longDescription: 'A Ronin cuts once. When eating, just eat. When walking, just walk. If you are on your phone, be on your phone 100%, then put it away 100%. The transition cost destroys the Spirit.',
        focus: 'A Ronin cuts once. When eating, just eat. When walking, just walk. If you are on your phone, be on your phone 100%, then put it away 100%. The transition cost destroys the Spirit.',
      },
    ],
  },
  {
    id: 'seal-body',
    name: 'The Body Seal',
    subPillars: [
      {
        id: 'body-1',
        name: 'The 11 PM Gate',
        shortDescription: 'Be in bed with lights out by 11:00 PM to recharge Jing.',
        longDescription: 'Your Gallbladder and Liver meridians repair between 11 PM and 3 AM. If you are awake, you are burning the fuel meant for tomorrow. Set a "Digital Sunset" at 10:00 PM.',
        focus: 'Your Gallbladder and Liver meridians repair between 11 PM and 3 AM. If you are awake, you are burning the fuel meant for tomorrow. Set a "Digital Sunset" at 10:00 PM.',
      },
      {
        id: 'body-2',
        name: 'Tortoise Warmth',
        shortDescription: 'Avoid cold exposure to neck and kidneys. Preserve internal heat.',
        longDescription: 'The Kidneys (the battery of the body) hate the cold. Keep your lower back covered. Do not sit on cold concrete. If you feel a chill, rub your palms together and place them on your kidneys.',
        focus: 'The Kidneys (the battery of the body) hate the cold. Keep your lower back covered. Do not sit on cold concrete. If you feel a chill, rub your palms together and place them on your kidneys.',
      },
      {
        id: 'body-3',
        name: 'Drop the Armor',
        shortDescription: 'Constantly release tension in the jaw, shoulders, and pelvic floor.',
        longDescription: 'Tension is a blockage. Throughout the day, scan your body: Is your tongue on the roof of your mouth? Are your glutes clenched? Drop them. Let gravity hold you.',
        focus: 'Tension is a blockage. Throughout the day, scan your body: Is your tongue on the roof of your mouth? Are your glutes clenched? Drop them. Let gravity hold you.',
      },
    ],
  },
  {
    id: 'seal-fuel',
    name: 'The Fuel Seal',
    subPillars: [
      {
        id: 'fuel-1',
        name: 'Warm Fire',
        shortDescription: 'Consume warm foods and liquids. Avoid ice and raw cold meals.',
        longDescription: 'Your stomach is a furnace. Ice water douses the fire, forcing the body to burn Qi just to warm the liquid. Drink room temperature or warm water only.',
        focus: 'Your stomach is a furnace. Ice water douses the fire, forcing the body to burn Qi just to warm the liquid. Drink room temperature or warm water only.',
      },
      {
        id: 'fuel-2',
        name: 'Steady Flame',
        shortDescription: 'Avoid sugar spikes and stimulants that cause energy crashes.',
        longDescription: 'Sugar and caffeine borrow energy from tomorrow. Eat complex sources of fuel. If you crave sugar, your Spleen Qi is weak—eat sweet root vegetables (yam, carrot) instead.',
        focus: 'Sugar and caffeine borrow energy from tomorrow. Eat complex sources of fuel. If you crave sugar, your Spleen Qi is weak—eat sweet root vegetables (yam, carrot) instead.',
      },
    ],
  },
  {
    id: 'seal-heart',
    name: 'The Heart Seal',
    subPillars: [
      {
        id: 'heart-1',
        name: 'The Iron Circle',
        shortDescription: 'Focus emotion only on what you can physically control.',
        longDescription: 'Draw a circle around your feet. If a problem is outside that circle, observe it without letting it enter your chest. Do not bleed energy over global events or other people\'s choices.',
        focus: 'Draw a circle around your feet. If a problem is outside that circle, observe it without letting it enter your chest. Do not bleed energy over global events or other people\'s choices.',
      },
      {
        id: 'heart-2',
        name: 'The Glass Wall',
        shortDescription: 'Observe others\' chaos without absorbing it.',
        longDescription: 'Visualize a thick glass wall between you and the person venting to you. You can see them and hear them, but their emotional "heat" cannot pass through the glass to touch you.',
        focus: 'Visualize a thick glass wall between you and the person venting to you. You can see them and hear them, but their emotional "heat" cannot pass through the glass to touch you.',
      },
    ],
  },
];

/**
 * Helper function to get content for a specific sub-pillar
 */
export const getSubPillarContent = (subPillarId: string): SubPillarContent | undefined => {
  for (const seal of SEALS_CONTENT) {
    const subPillar = seal.subPillars.find(sp => sp.id === subPillarId);
    if (subPillar) return subPillar;
  }
  return undefined;
};
