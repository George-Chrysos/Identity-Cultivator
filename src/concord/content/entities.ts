import type { EsotericConcept } from "@/concord/types";

export const entities: EsotericConcept[] = [
  {
    id: "the-operator",
    unifiedTerm: "The Operator",
    subtitle: "The one who can tell the registers apart",
    traditionalTerms: {
      daoist: ["The heart-mind", "Yi"],
      hermetic: ["The artifex", "The operator"],
      qabalistic: ["The adept"],
    },
    category: "Entities",
    summary:
      "The Operator is the human function that can tell the registers apart and can choose a practice without becoming it. Not a higher self, and not the personality with a new name. It is the ordinary, trainable capacity to notice “this is Charge, this is a story about Charge,” and to pick a tool up or set it down.",
    mechanics: [
      "The Operator is not [[mind-will|Mind/Will]]. Mind/Will is an office of the Triad. The Operator is the person-sized function that can refer to that office without stealing it.",
      "Inflation begins the moment a station’s name is taken as a personal title. “I am Tiphareth” is the Operator resigning.",
      "The tools are the rest of this register: a map, a seal, a circuit, one matter chosen for refinement, a stillness that is not a pose.",
      "Skill is accuracy of diagnosis, and the willingness to use a smaller tool than the ego prefers.",
      "The Operator is who sits down. Everything else in the register is what the sitter may be in right relation to.",
    ],
    equivalenciesExplanation:
      "Daoist writing often locates this function in the heart-mind that can be settled, and in the yi, the intention that can lead qi only because it has become quiet enough to lead. The alchemical artifex is the worker who is not the stone and without whom the stone does not occur. Western magic says adept, and then spends centuries warning the adept against identifying with the powers they invoke. This register says Operator because “adept” arrives already smelling of rank. The role is listed among entities so it is not confused with a sephirah or a treasure. You do not refine the Operator into qi. You train the Operator until they stop interfering with refinement.",
    infographicType: "diagram",
    relatedTermIds: ["mind-will", "the-threshold", "stillness", "foundation", "refinement"],
    tags: [
      "adept",
      "cultivator",
      "mage",
      "practitioner",
      "artifex",
      "yi",
      "witness",
      "heart-mind",
    ],
    registers: ["mind"],
    applications: [
      "In the next sit, add one act of labeling and no more: “store,” “weather,” or “story.” That labeling is the Operator waking up.",
      "Refuse titles for a season, including private ones. Function only.",
      "When you do not know which practice to use, you are at the Operator’s real job. Reread Foundation and choose the smallest true tool.",
    ],
    traditions: {
      daoist: {
        heading: "Intention as a servant",
        paragraphs: [
          "The yi is a good servant and a terrible lord. In the internal arts, intention can point, invite, and spoil. The trained operator is the person who has learned how little pointing is required, and who can sit inside zhuji without turning it into a project of self-manufacture.",
          "There is no rank attached. A person who follows the grain of the matter in front of them is operating. A person with many transmissions who cannot tell tension from qi is not, not yet. The title is functional, and it is revoked whenever you need it as a title.",
        ],
      },
      hermetic: {
        heading: "The artifex is not the fire",
        paragraphs: [
          "The worker tends the fire and does not claim to be the fire. That is the Hermetic ethics of this entry. The laboratory tradition is full of gifted, dishonest operators. The sorting rule here is the vessel rule. Does the worker serve the process, or is the process a theater for the worker?",
          "Study belongs to the Operator: learn the correspondences well enough to translate, and not so worshipfully that a Latin word ends the thinking. Read Salt as an office and then look at your own week. Study that never reaches the week is a hobby. The week that is never studied is a muddle. The artifex stands between them.",
        ],
      },
      qabalistic: {
        heading: "Borrow a quality, then give it back",
        paragraphs: [
          "The adept, in the better sense, can travel a path without annexing the sephirah at the end of it. The worse sense is a grade used as a personality. This register has no grades. It has an Operator who is responsible for not lying about which station they are actually in.",
          "Invocation and dismissal are worth keeping even if you never work ritually. You may borrow the clarity of Binah for an hour of hard thinking. You may not keep the name. Dismissal is hygiene. Without it, the role becomes a fancy, and the fancy becomes a costume you can no longer take off.",
        ],
      },
    },
    figure: {
      caption:
        "The Operator stands among the offices and is none of them. Select the sitter, then the office they are most tempted to steal.",
      nodes: [
        {
          id: "sitter",
          label: "The sitter",
          detail: "A person-sized function. Able to name store, weather, and story, and then choose a smaller tool.",
          conceptId: "the-operator",
        },
        {
          id: "mind",
          label: "Mind/Will",
          detail: "An office the Operator may refer to and may not wear as a name.",
          conceptId: "mind-will",
        },
        {
          id: "work",
          label: "The matter",
          detail: "Whatever is actually on the bench. Foundation if the store is empty. Refinement if it is not.",
          conceptId: "foundation",
        },
      ],
    },
    readingOrder: 16,
  },
  {
    id: "the-threshold",
    unifiedTerm: "The Threshold",
    subtitle: "The resistance that answers at a real gate",
    traditionalTerms: {
      daoist: ["Hun and Po", "The uneasy soul"],
      hermetic: ["The dweller on the threshold"],
      qabalistic: ["Paroketh", "The veil", "Da'at"],
    },
    category: "Entities",
    summary:
      "The Threshold is what answers when [[the-operator|the Operator]] tries to pass a gate the personality has organized itself to avoid. It is not a monster to fight and not a mood to sneer at. It is functional resistance at a narrow: the voice that bargains, frightens, flatters, or goes numb exactly when [[charge|Charge]] would have to be spent differently.",
    mechanics: [
      "The Threshold appears at a gate. If there is no specific narrow, you are meeting ordinary distraction. Ordinary distraction is handled by [[foundation|Foundation]], not by drama.",
      "Its tools are recognizable: sudden sleepiness, a brilliant reason to change methods, contempt, fear in a metaphysical costume, or a flattering vision of yourself as already through.",
      "It is made of unpaid [[current|Current]] and unacknowledged Charge. It thins when the matter is named in ordinary language and the expenditure changes. It strengthens when it is either obeyed or warred against as an external evil.",
      "Fighting it as a monster is one of its favorite requests. The fight keeps the old expenditure intact and adds heroism.",
      "Pass it by accuracy and by a smaller life, not by intensity.",
    ],
    equivalenciesExplanation:
      "Daoist language speaks of hun and po, the more yang and the more yin souls, whose conflict shows up as a person divided against their own animal life and their own clarity. When that conflict concentrates at a pass, it is a threshold event. Hermetic and later esoteric literature calls a similar meeting the guardian or the dweller on the threshold: the form of one’s refused life, appearing when the work gets costly. Qabalistic temple imagery places a veil, Paroketh, before the center, and an abyss of false knowledge, Da'at, where one would like to skip ahead. The Threshold is that meeting considered as a role the work reliably generates. You do not have to pretend it is an independent demon. You also do not have to pretend it is nothing. It is the pattern, encountered as if it were someone.",
    infographicType: "tree",
    relatedTermIds: ["the-gates", "the-operator", "stillness", "current", "refinement"],
    tags: [
      "guardian of the threshold",
      "dweller",
      "hun",
      "po",
      "paroketh",
      "veil",
      "resistance",
      "shadow",
      "daat",
      "da'at",
    ],
    registers: ["current", "mind"],
    applications: [
      "When resistance has a voice, write the sentence it is saying. Translate the sentence into an expenditure. That translation is the pass.",
      "Do not increase intensity to drown it out. Intensity is an offering it accepts.",
      "If the fear is tied to harm or to trauma, a clinician may be the gate. The Threshold is not a reason to refuse ordinary help. It is often the reason ordinary help is the honest next step.",
    ],
    traditions: {
      daoist: {
        heading: "A treaty, not an exorcism",
        paragraphs: [
          "Hun and po are a classical way of saying that a person is not internally unanimous. The po clings to appetite and to the fear of death. The hun orients toward a lighter order. Neidan does not ask you to murder the animal soul. A murdered animal life is a repressed one, and it leaks. The work is a treaty, which is why Foundation and Conservation come before any talk of guardians.",
          "At the passes, the treaty is tested. Pressure at the head, panic at the heart, a blank refusal at the base: these are often the earthly soul, or the heavenly soul’s contempt for it, speaking through sensation. The response this register endorses is not an exorcism. Sink the breath, soften the stance, and tell the truth about what is being protected. Usually it is an old spend.",
        ],
      },
      hermetic: {
        heading: "The dweller knows your vocabulary",
        paragraphs: [
          "The dweller on the threshold entered modern Western esotericism as a figure who blocks initiation and wears the initiate’s own unlived face. The experience is regular even when the mythology is too neat. At a certain honesty, the work stops being interesting and starts being costly, and something argues for a delay. The argument is intelligent. It knows your entire vocabulary.",
          "Do not debate it into a more spiritual substance. Separate. “This is the part that spends Charge on staying unexposed.” Then coagulate a different spend, usually a plain one: the conversation you have been avoiding, the hour of practice you keep upgrading into reading. The guardian is passed when the expenditure changes. Visions of victory are one of its masks.",
        ],
      },
      qabalistic: {
        heading: "The veil and the false knowledge",
        paragraphs: [
          "Paroketh exists because something is not yet able to bear what is behind it. The correct feeling at a veil is not self-hatred and not a battering ram. It is the recognition that the heart would have to feel a particular thing. Often grief. Sometimes ordinary shame, the kind with an apology or a repaired promise attached. Da'at is the intellectual mask of the same guardian: the rush to know the veil well enough to skip it.",
          "Ritual sometimes externalizes the guardian as a tested figure. That can serve the function, and it can become superstition. If your tradition gives you a procedure, let the procedure tell the truth, refuse the bargain, and return to Malkuth afterward. If the ceremony leaves you more frightened and more special, the Threshold has been fed.",
        ],
      },
    },
    figure: {
      caption:
        "The Threshold stands at a narrow, not everywhere. Name the gate, name the expenditure, and the figure has less to wear.",
      nodes: [
        {
          id: "upper",
          label: "The flattering mask",
          detail: "A vision of yourself already through. Da'at’s specialty. Do not take the promotion.",
          conceptId: "stillness",
        },
        {
          id: "veil",
          label: "The veil",
          detail: "Paroketh, the dweller, the bargain. It speaks in your best vocabulary.",
          conceptId: "the-threshold",
        },
        {
          id: "gate",
          label: "The actual gate",
          detail: "A specific narrow on the Axis. If you cannot locate it, this is not the Threshold yet.",
          conceptId: "the-gates",
        },
      ],
    },
    readingOrder: 17,
  },
];
