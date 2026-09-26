import type { EsotericConcept } from "@/concord/types";

export const cosmology: EsotericConcept[] = [
  {
    id: "the-triad",
    unifiedTerm: "The Triad",
    subtitle: "Three offices of a single life",
    traditionalTerms: {
      daoist: ["San Bao", "Jing, Qi, Shen"],
      hermetic: ["Tria Prima", "Salt, Mercury, Sulphur"],
      qabalistic: ["Middle Pillar", "Malkuth to the Supernals"],
    },
    category: "Cosmology",
    summary:
      "The Triad is the root map of this register. A person is read as three functional depths of one life: [[charge|Charge]], which can be stored; [[current|Current]], which moves and joins; and [[mind-will|Mind/Will]], which knows and gives form. The traditions do not share a vocabulary. They staff the same offices.",
    mechanics: [
      "Nothing in the work is “just energy.” Each event belongs to a register, and the registers are not interchangeable.",
      "Charge condenses. Current circulates. Mind/Will orients. Confusing one for another is how practice becomes expensive and vague.",
      "The Triad is read in both directions. Refinement moves from stored potential toward knowing. Condensation moves from knowing back into a life that can hold it.",
      "A practice is complete enough to trust only when all three have been named in it: what is stored, what is moving, and what is aware.",
    ],
    equivalenciesExplanation:
      "Daoist neidan calls the Triad the Three Treasures: [[charge|jīng]], [[current|qì]], and [[mind-will|shén]]. Alchemy calls it the Tria Prima: [[charge|Salt]], [[current|Mercury]], and [[mind-will|Sulphur]]. The Qabalah does not pack the same idea under one title. Its vertical depth does the work instead. [[charge|Malkuth]] is the dense kingdom. The band of [[current|Yesod and Tiphareth]] is where force becomes image and then coherence. The supernal span — [[mind-will|Kether, Chokmah, and Binah]] — is knowing that has not yet been parceled into a personality. These are offices, not translations. Where a tradition’s sentence is flattened by the map, keep the sentence and use the map as an index.",
    infographicType: "diagram",
    relatedTermIds: ["charge", "current", "mind-will", "the-vessel", "the-return"],
    tags: [
      "san bao",
      "three treasures",
      "tria prima",
      "salt mercury sulphur",
      "jing qi shen",
      "three principles",
    ],
    registers: ["charge", "current", "mind"],
    applications: [
      "Before a sitting, name which office you are actually touching. A great deal of “spiritual” effort is Current with a story about Mind laid over it.",
      "When a text says jing, salt, or Malkuth, read first for the office of storage. Import the rest of that tradition’s metaphysics only after the office is clear.",
      "Use the Triad as the table of contents. Every later entry is one office, a relation between offices, or something the operator does with them.",
    ],
    traditions: {
      daoist: {
        heading: "The Three Treasures",
        paragraphs: [
          "Jing, qi, and shen are not trophies stored in the body. Jing is the tendency to continue as a creature: repair, heat, sexual potency, the slow wax of a life. Qi is that continuance once it is moving — breath, warmth, the felt path of attention through flesh. Shen is the brightness that can look back at both.",
          "Neidan’s sequence, refining essence into breath, breath into spirit, and spirit into openness, is the Triad read upward. The treasures are three only in function. In a life that is working, they are constantly turning into one another. The error is to hunt the upper treasure while the lower one is being spent unnoticed.",
        ],
      },
      hermetic: {
        heading: "The three essentials",
        paragraphs: [
          "Salt, Mercury, and Sulphur are the practical metaphysics of the laboratory. Salt is what remains when the volatile has left: body, ash, the fixed. Mercury is the living go-between, able to be driven off and returned. Sulphur is the fiery signature, the individualizing soul of a substance.",
          "“As above, so below” is not a license to blur them. It is a claim that the same three offices appear in ore, in the retort, and in the operator. The work fails when sulphur is imagined without salt, or when mercury is spilled and then renamed spirit. The Triad keeps the laboratory honest after the glassware is gone.",
        ],
      },
      qabalistic: {
        heading: "A vertical, not a slogan",
        paragraphs: [
          "The Tree is a diagram of emanation, not a portrait of three substances. A working reader still keeps meeting a threefold cut: a dense kingdom, a mobile heart, and a supernal knowing that the personality does not own. This register borrows the middle line as its spine.",
          "It refuses the flatter claim that Malkuth is “the body” and Kether is “the soul.” Malkuth is the place where the whole Tree is received. That reception is what [[charge|Charge]] means here: not meat as opposed to spirit, but the office of holding. The supernals are not a mood one reaches by preferring them.",
        ],
      },
    },
    figure: {
      caption:
        "Three offices, one life. Select a vertex to place it, then open the entry if you want the full account.",
      nodes: [
        {
          id: "mind",
          label: "Mind/Will",
          detail: "What knows and gives form. Sulphur, shen, the crown and the supernal span.",
          conceptId: "mind-will",
        },
        {
          id: "charge",
          label: "Charge",
          detail: "What can be stored. Salt, jing, the kingdom that holds.",
          conceptId: "charge",
        },
        {
          id: "current",
          label: "Current",
          detail: "What moves and joins. Mercury, qi, the band between foundation and heart.",
          conceptId: "current",
        },
      ],
    },
    readingOrder: 1,
  },
  {
    id: "heaven-and-earth",
    unifiedTerm: "Heaven and Earth",
    subtitle: "The two poles the operator stands inside",
    traditionalTerms: {
      daoist: ["Tian and Di", "San Cai"],
      hermetic: ["Above and Below", "As above, so below"],
      qabalistic: ["Kether and Malkuth"],
    },
    category: "Cosmology",
    summary:
      "Heaven and Earth are the poles of the world this register assumes. Heaven names what gives measure without being grasped. Earth names what receives, holds, and feeds. The human is not a third substance beside them. The human is the place where they can be worked.",
    mechanics: [
      "Heaven corresponds, inside a person, to the office of [[mind-will|Mind/Will]]: orientation, limit, the unforced clarity practice is trying to stop obstructing.",
      "Earth corresponds to [[charge|Charge]]: capacity, nourishment, the kingdom that can actually hold a change.",
      "[[current|Current]] is not a pole. It is the weather between them, the exchange that makes a pole mean anything in a life.",
      "A practice that courts Heaven while starving Earth becomes bright and brittle. A practice that only feeds Earth becomes heavy and asleep.",
    ],
    equivalenciesExplanation:
      "Daoist cosmology speaks of Tian and Di, Heaven and Earth, with the human as the third of the Three Powers, san cai. The human does not conquer the other two. The human harmonizes them. Hermetic writing says the same thing from inside the laboratory: what is above answers to what is below, and the operator is the glass in which the answering becomes visible. On the Tree the poles are [[mind-will|Kether]] and [[charge|Malkuth]]. Everything worth calling practice is the exchange between them, which is why [[the-axis|the Axis]] has a direction at all.",
    infographicType: "diagram",
    relatedTermIds: ["the-triad", "the-axis", "the-operator", "mind-will", "charge"],
    tags: [
      "tian",
      "di",
      "heaven",
      "earth",
      "as above so below",
      "san cai",
      "macrocosm",
      "kether",
      "malkuth",
    ],
    registers: ["charge", "mind"],
    applications: [
      "Check a practice against both poles. What in it feeds capacity, and what in it clarifies knowing?",
      "If the life below is chaotic, do not add a more elaborate heaven. Repair the receiving pole. That repair is [[foundation|Foundation]].",
      "Read “as above, so below” as an audit. A shift in mind that never alters conduct or capacity has not yet happened below.",
    ],
    traditions: {
      daoist: {
        heading: "The Three Powers",
        paragraphs: [
          "Classical Daoist texts do not begin with a technique. They begin with a sky and a ground. Heaven covers and gives seasons. Earth bears and does not boast of bearing. The cultivator who understands this stops trying to be a sky. Laying a foundation is an Earth art: sleep, food, honest limits, the decision not to leak the store.",
          "San cai is easy to sentimentalize. In the neidan manuals the human power is specific. It is the presence that can tell jing worth keeping from jing worth transforming, qi that is circulating from qi that is merely mood, shen that is clear from shen that is excited. That discernment is the human office between Tian and Di.",
        ],
      },
      hermetic: {
        heading: "The below audits the above",
        paragraphs: [
          "The Tablet’s formula is a working rule. If a change cannot be shown in the vessel, it has not yet happened in the heaven of the work. Renaissance alchemists were often ruthless about this. Visions were smoke until the matter in the flask responded. Translated here: a shift in [[mind-will|Mind/Will]] that never alters [[charge|Charge]] is still a mood.",
          "“Earth” in alchemy is also one of the four elements, and it folds toward Salt when the four are read back into the three. When this register says Earth, it means the receiving pole, not a particular schema of dry cold. The narrower office lives on the [[charge|Charge]] page. The pole is what makes that office necessary.",
        ],
      },
      qabalistic: {
        heading: "Crown and kingdom",
        paragraphs: [
          "Kether is not a heaven one travels to. It is the first, least conditioned sephirah, a crown that touches the negative veils. Malkuth is not dirt. It is the kingdom in which every other sephirah is supposed to become livable. A practice that meditates only upward and will not tend the schedule, the body, the room, and the promises is refusing the Earth of the Tree.",
          "The span between them is the middle pillar, drawn in this register as [[the-axis|the Axis]]. Heaven and Earth explain why that line is not a decoration. Without the poles, circulation is only stirring. With them, every ascent has a kingdom it owes a return to.",
        ],
      },
    },
    figure: {
      caption:
        "Two poles and the meeting place. Heaven gives measure. Earth receives. The operator stands where the work is possible.",
      nodes: [
        {
          id: "heaven",
          label: "Heaven",
          detail: "The giving pole. Measure, clarity, the office of Mind/Will.",
          conceptId: "mind-will",
        },
        {
          id: "meeting",
          label: "The meeting",
          detail: "The human is not a third substance. The human is where the poles can be worked.",
          conceptId: "the-operator",
        },
        {
          id: "earth",
          label: "Earth",
          detail: "The receiving pole. Capacity, nourishment, the office of Charge.",
          conceptId: "charge",
        },
      ],
    },
    readingOrder: 7,
  },
  {
    id: "the-vessel",
    unifiedTerm: "The Vessel",
    subtitle: "The body as the only honest laboratory",
    traditionalTerms: {
      daoist: ["Ding", "Furnace and cauldron"],
      hermetic: ["Vas hermeticum", "Athanor"],
      qabalistic: ["The Temple", "The microcosm"],
    },
    category: "Cosmology",
    summary:
      "The Vessel is the person considered as apparatus. Not a shell to escape, and not a machine to hack. It is the closed place in which [[charge|Charge]] can be kept, [[current|Current]] moved, and [[mind-will|Mind/Will]] clarified without leaking into performance.",
    mechanics: [
      "The Vessel includes flesh, breath, and the ordinary mind that can sit still. It is the whole apparatus that can hold a heat, not “the body” as opposed to experience.",
      "A sealed vessel is not a tense one. Sealing means the process is not spent outward as display, argument, or constant discharge.",
      "The three fields — lower, middle, upper — are stations inside the Vessel. Lower stores. Middle exchanges. Upper clarifies. They are not organs with occult job titles pasted on.",
      "If the Vessel is exhausted, injured, or frantic, the operation is repair. Firing a cracked retort is how people become strange and unwell.",
    ],
    equivalenciesExplanation:
      "Neidan calls the body a ding, a cauldron, and sometimes distinguishes furnace and cauldron: the place of fire and the place where the medicine gathers. Alchemy says vas hermeticum, the hermetic vessel, and athanor, the furnace that holds one temperature. The Qabalistic image is the temple and the microcosm: [[charge|Malkuth]] as a dwelling the glory can actually enter. In all three, the Vessel is cosmology because the map of the world is being claimed to fit inside one life. That claim is a working map. It is not a cartoon in which the skull contains a small sky.",
    infographicType: "dantian-map",
    relatedTermIds: ["charge", "foundation", "the-axis", "conservation", "the-gates"],
    tags: [
      "ding",
      "cauldron",
      "vas hermeticum",
      "athanor",
      "temple",
      "microcosm",
      "body",
      "dantian",
    ],
    registers: ["charge", "current", "mind"],
    applications: [
      "Treat pain, compulsion, and chronic exhaustion as vessel problems first. Do not spiritualize a cracked pot.",
      "Close the work by not narrating it for a while. Secrecy here is thermal, not theatrical.",
      "When you sit, know which field you are warming. The line they share is [[the-axis|the Axis]]. The narrows between them are [[the-gates|the Gates]].",
    ],
    traditions: {
      daoist: {
        heading: "Furnace and cauldron",
        paragraphs: [
          "The ding is heated from below. That single image corrects a great deal of later fantasy. The fire of practice is not applied to the head. It is a gentle, sustained warmth in the lower field, and the upper clarity is a consequence, not a target one grabs. Manuals warn against scorching the cauldron: forcing breath and sensation until the body produces noise and the noise is mistaken for qi.",
          "The vessel is closed by rhythm more than by heroic effort. A leaky life — chaotic sleep, contempt for food and rest, intensity performed for an audience — cannot cook anything subtle. This is why [[foundation|Foundation]] precedes every brighter operation in the reading order.",
        ],
      },
      hermetic: {
        heading: "Lid and steady fire",
        paragraphs: [
          "The vessel must be closed, the texts say, and then they argue for pages about what closed means. A process exposed too soon exchanges with the room and stops being a process. In inner work the room is other people’s attention, and one’s own. Talking the work away, checking for signs, adjusting the posture every few breaths: these are ways of taking the lid off.",
          "The athanor is the complementary image. Not a blaze. A furnace that can hold one temperature for a long time. Operators who can only practice in peaks do not have an athanor. They have a match. The Vessel, on this shore, is the demand that the work survive an ordinary Tuesday.",
        ],
      },
      qabalistic: {
        heading: "A temple that can be lived in",
        paragraphs: [
          "The temple is prepared before it is invoked. That sentence is Malkuth as a spiritual art. The room, the hour, the cleanliness of the instruments, the decision not to begin in a rage. Later Western orders made this procedural. The underlying point is simpler. The kingdom is not a waiting room for the higher sephiroth. It is the condition of their manifestation.",
          "The microcosm doctrine says the Tree is in the person. This register accepts that as a working map and declines the inflation that follows it. Containing a diagram of the heavens is not the same as being in charge of them. The Vessel holds a process. It does not grant a rank.",
        ],
      },
    },
    figure: {
      caption:
        "Three fields in one vessel. Storage low, exchange in the middle, clarification above. The loop is the Circuit, drawn lightly around them.",
      nodes: [
        {
          id: "lower",
          label: "Lower field",
          detail: "Storage. The seat of Charge and the hearth of the work.",
          conceptId: "charge",
        },
        {
          id: "middle",
          label: "Middle field",
          detail: "Exchange. Where warmth becomes a felt current.",
          conceptId: "current",
        },
        {
          id: "upper",
          label: "Upper field",
          detail: "Clarification. Where knowing can steady without being grabbed.",
          conceptId: "mind-will",
        },
      ],
    },
    readingOrder: 5,
  },
  {
    id: "the-axis",
    unifiedTerm: "The Axis",
    subtitle: "The spine from store to crown",
    traditionalTerms: {
      daoist: ["Du Mai and Ren Mai", "The central channel"],
      hermetic: ["Axis mundi"],
      qabalistic: ["The Middle Pillar"],
    },
    category: "Cosmology",
    summary:
      "The Axis is the vertical line inside [[the-vessel|the Vessel]] along which the Triad is arranged. Low on the line, life is stored. In the middle, it coheres. High on the line, it becomes quiet knowing. Circulation turns around this shaft. It is not a second shaft.",
    mechanics: [
      "The Axis is a functional line, not a claim that one physical nerve is the whole secret. Sensation may track it. Anatomy does not have to vouch for the metaphysics.",
      "Ascent without a downward return overheats the upper field and empties the lower. The line is for travel in both directions.",
      "[[the-gates|The Gates]] sit on the Axis. A gate is a place [[current|Current]] catches, not a reward for climbing.",
      "To be “on the axis” in a sitting means attention is central: not lost in side-reactivity, not braced, not performing a posture for an audience of one.",
    ],
    equivalenciesExplanation:
      "In neidan the governing vessel runs up the back and the conception vessel down the front. Their coupling is the small heavenly orbit, treated operationally under [[the-circuit|the Circuit]] and [[circulation|Circulation]]. The Axis is what remains if you subtract the travel and keep the center those routes circle. Hermetic “as above, so below” needs a shaft inside the person or it is only a slogan. The Middle Pillar — Malkuth, Yesod, Tiphareth, and on toward Kether, with Da'at as a crossing one does not own — is the Qabalistic drawing of the same shaft. Side pillars matter in Qabalah. This register sets them aside so the vertical offices stay readable.",
    infographicType: "tree",
    relatedTermIds: ["the-circuit", "the-gates", "charge", "current", "mind-will"],
    tags: [
      "middle pillar",
      "du mai",
      "ren mai",
      "central channel",
      "axis mundi",
      "sushumna",
      "vertical",
    ],
    registers: ["charge", "current", "mind"],
    applications: [
      "When sensation rises, locate it on the line before you interpret it. Location first. Mythology second.",
      "Balance every upward emphasis with a downward return of attention into the lower field.",
      "Use this page as the legend for both the Tree figure and the dantian figure. They are two drawings of one shaft.",
    ],
    traditions: {
      daoist: {
        heading: "Back path, front path, center",
        paragraphs: [
          "Du and Ren are the traditional description of a back-path and a front-path that quiet attention can learn to feel. The back is often described as rising, the front as descending. What this register calls the Axis is the still statement of that anatomy: a single vertical about which the orbit turns.",
          "Teachers in the internal arts spend more time settling the lower field than opening the crown, because an axis with no base is a pole stuck in air. The lower dantian is the end of the Axis that touches Earth, which is to say [[charge|Charge]]. Crown phenomena in an empty lower field are not evidence that the Axis has been climbed. They are evidence that it has been left.",
        ],
      },
      hermetic: {
        heading: "A place to put a report",
        paragraphs: [
          "Axis mundi language is older than any one alchemist. The useful part is modest. A vertical lets you say where a process is. “I am stirred up” is not a location. “The heat is in the head and the belly is absent” is a location. Hermetic practice, when it is honest, is full of these plain reports: the matter rose, the matter fell, the matter went dead, the matter revived.",
          "The Axis also stops a side-path from impersonating the work. Moods, images, and personal myths collect at the edges. The shaft is whatever is still there when those have been acknowledged and set aside. That discipline of attention belongs with [[the-operator|the Operator]].",
        ],
      },
      qabalistic: {
        heading: "The middle line",
        paragraphs: [
          "The Middle Pillar is both a diagram and, in the modern Western tradition, a practice of establishing a column of attention in the body. This register cares first about the diagram. Placements vary by school: base, generative center, heart, the crossing at the throat, the crown. The function is a graded vertical, not a fight about inches.",
          "Da'at is included as a warning, not as a campsite. It is knowledge that is not a sephirah one owns. On the Axis it marks the place where Current wants to become a story about itself. The corrective is [[stillness|Stillness]], not an additional concept.",
        ],
      },
    },
    figure: {
      caption:
        "The middle line, read from crown to base. Select a station. The side pillars are deliberately absent so the offices stay clear.",
      flow: "descend",
      nodes: [
        {
          id: "crown",
          label: "Crown",
          detail: "Mind/Will. Clarity that does not need to grasp the station as an identity.",
          conceptId: "mind-will",
        },
        {
          id: "heart",
          label: "Heart",
          detail: "Current, where movement coheres instead of merely stirring.",
          conceptId: "current",
        },
        {
          id: "base",
          label: "Base",
          detail: "Charge, where the Axis meets Earth and the work becomes holdable.",
          conceptId: "charge",
        },
      ],
    },
    readingOrder: 6,
  },
  {
    id: "the-return",
    unifiedTerm: "The Return",
    subtitle: "The work moves back toward simplicity",
    traditionalTerms: {
      daoist: ["Fanben huanyuan", "Return to the source"],
      hermetic: ["Solve et coagula", "The circular opus"],
      qabalistic: ["The path of return"],
    },
    category: "Cosmology",
    summary:
      "The Return is the direction of the whole register. Cultivation is not the accumulation of special states. It is a reversal: what has been spent downward into habit is gathered, refined, and brought back toward an unforced simplicity — and then allowed to live downstairs again.",
    mechanics: [
      "Emanation and return are a pair. Multiplicity proceeds from simplicity. The work walks some of that multiplicity back without pretending to cancel the world.",
      "Return is not nostalgia and not a trance. It is the Triad becoming less tangled: Charge sufficient, Current unobstructed, Mind/Will unforced.",
      "The last step in the classical sequences is not a bigger experience. It is openness. See [[stillness|Stillness]].",
      "A return that cannot come back down into ordinary kindness and ordinary duty has only gone up.",
    ],
    equivalenciesExplanation:
      "Fanben huanyuan, returning to the origin, is the cosmological sentence behind neidan’s three refinements. The Hermetic opus is circular on purpose: distillation and coagulation repeat until the volatile and the fixed will stay together. Qabalistic return is the ascent of consciousness through stations that a lightning-flash once descended. This register calls all three the Return so a reader can see that [[transmutation|Transmutation]] is not self-improvement. It is a direction. The endpoint is not described as a prize. It is the Triad no longer at war with itself.",
    infographicType: "flowchart",
    relatedTermIds: ["transmutation", "refinement", "stillness", "mind-will", "the-triad"],
    tags: [
      "fanben huanyuan",
      "return to the source",
      "path of return",
      "solve et coagula",
      "opus",
      "reversal",
    ],
    registers: ["charge", "current", "mind"],
    applications: [
      "Judge a season of practice by simplification: fewer leaks, fewer stories, a steadier ordinary life.",
      "When a practice only adds experiences, it is not yet on the Return. Ask what it is refining, and into what.",
      "Read [[refinement|Refinement]] for the operation. Stay on this page when you want the reason the operation has a direction.",
    ],
    traditions: {
      daoist: {
        heading: "Back to the source",
        paragraphs: [
          "Daoist return is easy to fake with a fantasy of the womb or of a past purity. The manuals are drier. Returning means jing is no longer squandered in reactivity, qi is no longer blocked by force, and shen is no longer hired out to every passing image. The source is not a memory. It is what presence is like when it stops adding.",
          "There is a humility in the classical images for accomplishment: uncarved wood, an infant’s grip, a valley. The Return, if it is real, looks like less performance. A person who glows as an advertisement has not completed the sentence the tradition actually wrote.",
        ],
      },
      hermetic: {
        heading: "A circle, not a ladder",
        paragraphs: [
          "Solve et coagula is the art in two words. Separate what has been wrongly fused — the story glued to the craving, the fear glued to the breath — and join what has been wrongly split — the knowing that will not inhabit the life. Repeat. Ladders flatter the ego with height. Circulation asks whether the condensate returned.",
          "The Stone, read inwardly, is not a supernatural object in this register. It is a life in which the fixed and the volatile will stay in the same room: Charge, Current, and Mind/Will in agreement. The Return is how that agreement is approached, and it is allowed to take as many turns as the matter requires.",
        ],
      },
      qabalistic: {
        heading: "You start from where you are",
        paragraphs: [
          "The Tree is usually drawn as a descent, from crown to kingdom. The work of a person is mostly the other way: a return of attention, in honesty, through the stations one actually inhabits. You do not begin at Kether because the word is beautiful. You begin in Malkuth because that is where you are.",
          "Return also warns against theft. Taking a divine name as an identity is the opposite of this path. Return gives a station back to its function. [[the-operator|The Operator]] stops standing in for the Absolute. That is why this entry is last in the reading order. It is the sense of the earlier machinery, available once the machinery has been seen.",
        ],
      },
    },
    figure: {
      caption:
        "The direction of the work. Multiplicity is not despised. It is walked back toward a simplicity that can still live in the kingdom.",
      flow: "ascend",
      nodes: [
        {
          id: "many",
          label: "Spent life",
          detail: "Charge scattered into habit. The place the return actually starts.",
          conceptId: "charge",
        },
        {
          id: "work",
          label: "The working",
          detail: "Circulation and refinement. The conversions, repeated until they are clean.",
          conceptId: "transmutation",
        },
        {
          id: "simple",
          label: "Simplicity",
          detail: "The Triad no longer at war with itself, and still willing to come downstairs.",
          conceptId: "the-triad",
        },
      ],
    },
    readingOrder: 18,
  },
];
