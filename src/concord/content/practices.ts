import type { EsotericConcept } from "@/concord/types";

export const practices: EsotericConcept[] = [
  {
    id: "foundation",
    unifiedTerm: "Foundation",
    subtitle: "Make a vessel that can be heated",
    traditionalTerms: {
      daoist: ["Zhuji", "Laying the foundation"],
      hermetic: ["First matter", "Preparation of the vessel"],
      qabalistic: ["The work of Malkuth"],
    },
    category: "Practices",
    summary:
      "Foundation is the decision to make a [[the-vessel|Vessel]] that can hold heat. It is the laying down of [[charge|Charge]]: sleep, food, honest limits, a regular hour, and the end of practices that exist to be seen. Everything brighter in this register waits on it.",
    mechanics: [
      "Foundation is a practice with contents, not a mood of humility. A body being repaired. A day mostly tellable. A reserve no longer in free fall.",
      "No later technique compensates for a missing foundation. Circulation on an empty store rehearses a map.",
      "The standard is unspectacular stability. A quiet month outweighs a dramatic retreat.",
      "Foundation includes the room and the hour. A life with no protected time has intentions, not a laboratory.",
      "When it is sufficient, warmth in the lower field appears without being hunted. That is the handoff to [[circulation|Circulation]].",
    ],
    equivalenciesExplanation:
      "Zhuji is sometimes translated as a preliminary and then skipped, which is like skipping the crucible. The Daoist point is that jing must be replenished and the temperament steadied before the orbit is anything but theater. Hermetic first matter is the substance the art agrees to start from, purified of obvious contamination. Inwardly it is the ordinary life, cleaned of the grossest leaks and then not despised for being ordinary. Qabalistic Malkuth-work is the same gate: the kingdom made fit. Foundation is how this register says “begin here” to all three readers.",
    infographicType: "dantian-map",
    relatedTermIds: ["charge", "conservation", "the-vessel", "circulation", "the-operator"],
    tags: [
      "zhuji",
      "laying the foundation",
      "first matter",
      "prima materia",
      "malkuth",
      "preparation",
      "beginner",
    ],
    registers: ["charge"],
    applications: [
      "Set a minimum daily tending of the store: a fixed hour, a bedtime, a walk, a meal taken while you are present. Keep it smaller than your enthusiasm.",
      "Drop any technique you cannot explain as Charge, Current, or Mind/Will. Opaque practices at this stage are usually theater.",
      "Stay until the lower field is warm more often than it is hunted. Then read Circulation, not before.",
    ],
    traditions: {
      daoist: {
        heading: "Zhuji",
        paragraphs: [
          "Manuals worth reading are patient at the start. They ask for a settled heart-mind, a regulated desire, and a lower field that can hold warmth, long before they ask for transports. Zhuji is that patience made into a phase. Food and sleep appear because the essence is not a symbol. It is the capacity of a creature that has been given a spirit.",
          "The test is dull. Can you sit for the agreed time without manufacturing a sensation to justify the sitting? Can you stop when the time is done? Can you do it again tomorrow without narrating your progress? Foundation is the phase in which the answer becomes yes. People who refuse the phase become collectors of methods.",
        ],
      },
      hermetic: {
        heading: "One substance, cleaned",
        paragraphs: [
          "The first matter must be pure, the texts say, and then they argue about what it is. The operational agreement is more useful than the argument. Start from one substance. Do not throw a second metal into the flask because you are bored. Inwardly: pick the life you actually have, and stop contaminating the work with a borrowed personality gathered from books.",
          "Preparation is physical in a way that embarrasses spiritual readers. The alchemists cleaned vessels. A modern operator cleans the obvious equivalents: stolen sleep, substances used to counterfeit [[current|Current]], attention leaked into other people’s emergencies. This is the condition under which a heat can accumulate. [[conservation|Conservation]] is the part of foundation that is specifically a seal.",
        ],
      },
      qabalistic: {
        heading: "Sweep the temple",
        paragraphs: [
          "A temple is swept before it is consecrated. Western orders turned that into rules about robes and banishing. The rules are useful only if they produce a real Malkuth: a place and a person capable of beginning. The banishing that matters, outside a ceremonial idiom, is the banishing of pretense. For the duration of the practice you are a person sitting down.",
          "Foundation also means learning the territory you can actually observe. Most students can observe Malkuth and, with honesty, some of Yesod. Beginning with an essay about Kether is a way of not beginning. The reading order of this register is arranged to make that evasion harder.",
        ],
      },
    },
    figure: {
      caption:
        "Foundation heats nothing exotic. It makes the lower field capable of holding warmth, and it refuses to start the loop before that warmth is real.",
      nodes: [
        {
          id: "store",
          label: "The store",
          detail: "Charge, replenished on purpose. The whole of this practice.",
          conceptId: "charge",
        },
        {
          id: "seal",
          label: "The seal",
          detail: "Conservation. Foundation fails if the day’s leaks are larger than the sitting.",
          conceptId: "conservation",
        },
        {
          id: "handoff",
          label: "The handoff",
          detail: "Warmth that arrives without being hunted. Only then is Circulation honest.",
          conceptId: "circulation",
        },
      ],
    },
    readingOrder: 11,
  },
  {
    id: "conservation",
    unifiedTerm: "Conservation",
    subtitle: "Spend the reserve slower than it restores",
    traditionalTerms: {
      daoist: ["Guarding jing", "Sealing the leaks"],
      hermetic: ["Sealing the vessel", "Fixing the volatile"],
      qabalistic: ["Silence", "Not scattering the kingdom"],
    },
    category: "Practices",
    summary:
      "Conservation is the sealing of [[charge|Charge]]. It is the practice of spending the reserve slower than it is restored, and of noticing the particular leaks by which a life pours itself out. The functional rule is hydraulics. It is not a costume of purity.",
    mechanics: [
      "The common leaks are few: chronic sleep debt, performative emotion, sexual spending that leaves a person vacant rather than devoted, endless speech, and attention donated to outrage.",
      "Sealing is not clenching. A clenched jaw is already a spend. Conservation feels like a slightly fuller quiet, not like a held breath.",
      "Speech converts inner Current into social heat. Some speech is the work. Most speech about the work is a leak.",
      "Conservation without kindness becomes miserliness, and miserliness is fear holding the store hostage. The aim is a reserve that can be spent on purpose.",
      "This is the daily form of keeping [[the-vessel|the Vessel]] closed.",
    ],
    equivalenciesExplanation:
      "Daoist literature spends a great deal of ink on guarding jing. Some of it is ascetic, some of it is technical in ways this register will not turn into a manual, and some of it is simply the observation that a body treated as an inexhaustible well becomes a shallow one. Hermetic sealing is the laboratory version: do not open the flask to admire the vapor. Qabalistic silence, and the discipline of not scattering the kingdom, is the same office in temple language. Conservation states the shared practice without the costume. Keep the store until you mean to spend it, and spend it on the conversion you actually chose.",
    infographicType: "diagram",
    relatedTermIds: ["charge", "foundation", "the-vessel", "stillness", "refinement"],
    tags: [
      "sealing",
      "guarding jing",
      "retention",
      "silence",
      "leak",
      "frugality",
      "jing",
      "vessel",
    ],
    registers: ["charge"],
    applications: [
      "For one week, note the hour and the kind of each obvious leak. Do not correct them all. See the pattern.",
      "Choose one seal: a bedtime, a limit on narrating your inner life, or a limit on one compulsion. Keep only that until it is dull.",
      "If conservation makes you rigid and superior, it has flipped into fear. Restore ordinary warmth and reread [[the-vessel|the Vessel]].",
    ],
    traditions: {
      daoist: {
        heading: "Guarding the essence",
        paragraphs: [
          "Modern retellings often reduce the guarding of jing to a single obsession. The older concern is wider. Essence leaves through exhaustion, fright, overwork, a sexual life conducted as a proof of something, and a restless mind that never lets the body arrive at night. The remedy the texts trust is measure, not a feat.",
          "There is a specific warning against lifting the essence by force, the tension people invent when they hear that something should be retained. Force is a leak with a spiritual rationale. Where the traditional literature discusses sexual practice in technical detail, this register stops at the office. The office is enough to study: do not spend the store unconsciously, and do not turn retention into a performance of purity.",
        ],
      },
      hermetic: {
        heading: "Do not open the flask",
        paragraphs: [
          "A vessel opened for admiration loses the work. The operator’s version of opening the flask is checking, midway, whether the experience is worth reporting. The vapor leaves into the audience, even if the audience is imaginary.",
          "Frugality also applies to will. Sulphur spent on ten projects is ten small smokes. Conservation of [[mind-will|Mind/Will]] looks like finishing, or like honestly quitting. It is the end of the half-sworn vow, which taxes the store while pretending to be an ideal. One aim, funded by the life, is the sealed retort.",
        ],
      },
      qabalistic: {
        heading: "Let a name densify",
        paragraphs: [
          "The kingdom is scattered by habits that feel like engagement. Constant public conversation with the tradition is often Malkuth leaking into Yesod’s worst habit: image without embodiment. Silence, in the practical qabalah, lets a name mean something. Speak every operation and none of them densifies.",
          "Severity should not become contempt for other people. Conservation turned outward as judgment is another spend, and a nasty one. The seal is on one’s own vessel. The work is local enough to finish by nightfall: where did today’s Charge go, and did I send it?",
        ],
      },
    },
    figure: {
      caption:
        "A closed vessel, a store, and the operator who decides the spend. Conservation is the lid. It is not the refusal to live.",
      nodes: [
        {
          id: "store",
          label: "Charge",
          detail: "The reserve being sealed. Conservation has no other object.",
          conceptId: "charge",
        },
        {
          id: "lid",
          label: "The seal",
          detail: "Not clenching. A life that spends slower than it restores, on purpose.",
          conceptId: "conservation",
        },
        {
          id: "aim",
          label: "A chosen spend",
          detail: "The store exists to be used. Refinement is what a deliberate spend looks like.",
          conceptId: "refinement",
        },
      ],
    },
    readingOrder: 12,
  },
  {
    id: "circulation",
    unifiedTerm: "Circulation",
    subtitle: "Let the loop turn, and stop hauling it",
    traditionalTerms: {
      daoist: ["Turning the small orbit", "Xiao Zhou Tian"],
      hermetic: ["Circulation of the light"],
      qabalistic: ["Circulating the Middle Pillar"],
    },
    category: "Practices",
    summary:
      "Circulation is the practice of letting [[current|Current]] take [[the-circuit|the Circuit]], and of getting out of its way. The map is already drawn. This entry is about manner: when to begin, how little force is enough, and how to recognize the counterfeit in which a person drags a sensation around a memorized route.",
    mechanics: [
      "Begin only when [[foundation|Foundation]] has produced some warmth that arrives without being chased. Until then, sit and tend the lower field. That sitting is already the practice.",
      "If you trace a route, trace it lightly, as a reminder, and then prefer any spontaneous warmth to the reminder. The map is a trellis. It is not the vine.",
      "The minimal loop is enough: gather low, allow a rise along the back, allow a descent along the front, gather again. Stop while it is still clean.",
      "Counterfeit circulation gets stronger when you push and dies when you rest. Honest circulation gets simpler when you rest.",
      "End by settling attention low. The end of the sit is part of the loop.",
    ],
    equivalenciesExplanation:
      "The Daoist small orbit is the practice this entry translates. Not the greater orbit, and not a promise of signs. Western readers may know a related form as the circulation of the light, or may have learned a Middle Pillar circulation in a ceremonial order. Use those as dialects. The instruction that survives translation is the same. Establish a vertical, move gently, include the return, and do not confuse a visualized line with a living current. The mechanics without the instruction are [[the-circuit|the Circuit]]. If the movement sticks, read [[the-gates|the Gates]] rather than inventing a stronger breath.",
    infographicType: "flowchart",
    relatedTermIds: ["the-circuit", "current", "foundation", "refinement", "the-gates"],
    tags: [
      "small orbit",
      "microcosmic orbit",
      "turning the wheel",
      "middle pillar practice",
      "circulation of the light",
      "xiao zhou tian",
    ],
    registers: ["current"],
    applications: [
      "Ten quiet minutes. Gather low. One gentle loop, or none if no warmth is present. Stop. Write one line about where it actually was.",
      "Do not add force to fix a stuck place during the sit. Note the place and consult the Gates afterward.",
      "Keep the practice smaller than your curiosity for a month. Curiosity is a leak with good manners.",
    ],
    traditions: {
      daoist: {
        heading: "Lead gently, or do not lead",
        paragraphs: [
          "A sober teacher asks where the heat is before asking the student to lead anything. If the lower field is numb and the mind is bright, the prescription is more foundation, not a more detailed route. When the time comes, schools disagree about which half of the breath carries the ascent. They agree that violence is a mistake.",
          "The sign of a real orbit, across those disagreements, is that it starts to turn by itself and that the temperament cools rather than inflames. Chasing lights at the passes is treated mostly as a fault. So is a hot head and a scattered heart. The correction is almost always to sink, to reduce, and to close the session. A short honest circulation outweighs a long heroic one.",
        ],
      },
      hermetic: {
        heading: "The descent is sacred",
        paragraphs: [
          "The pelican flask feeds its distillate back into itself. Translated into a sitting: take whatever has risen — a warmth, a clean sentence of insight — and return it to the matter. The moment you refuse to bring the warmth down because the head feels more spiritual, you have chosen vapor.",
          "An operator trained in ritual can circulate along the column they already know, provided they drop the obsession with correct names during the quiet work. Names have their hour in liturgy. In circulation, a name said to force a sensation is a push. Say less. Let the flask do what a flask does when the heat is right and the lid is on.",
        ],
      },
      qabalistic: {
        heading: "Evenness, not coronation",
        paragraphs: [
          "If you work the Middle Pillar, do it as a circulation and not as a promotion. Establishing the centers remembers [[the-axis|the Axis]]. It does not crown you. The common failure is a brilliant crown and an absent base. Begin at the base every time. End at the base every time.",
          "A circulation that makes you more irritable with the people you live with is a hot head, whatever the internal display. Beauty, Tiphareth’s other name, is recognizable in conduct. Use that as a check before you use any private sensation as a check.",
        ],
      },
    },
    figure: {
      caption:
        "The practice in one loop. Gather before you rise. Return before you interpret. Stop while the loop is still clean.",
      flow: "cycle",
      nodes: [
        {
          id: "gather",
          label: "Gather",
          detail: "Lower field first. If it is empty, this sitting is Foundation, and that is correct.",
          conceptId: "foundation",
        },
        {
          id: "turn",
          label: "Turn",
          detail: "A light pass around the Circuit. Prefer spontaneous warmth to the memorized route.",
          conceptId: "the-circuit",
        },
        {
          id: "settle",
          label: "Settle",
          detail: "Attention back down. The mind quieter than you found it.",
          conceptId: "current",
        },
      ],
    },
    readingOrder: 13,
  },
  {
    id: "refinement",
    unifiedTerm: "Refinement",
    subtitle: "One real matter, passed through the Triad",
    traditionalTerms: {
      daoist: ["The three refinements"],
      hermetic: ["Distillation", "The Great Work"],
      qabalistic: ["Pathworking", "Repair of a spark"],
    },
    category: "Practices",
    summary:
      "Refinement is [[transmutation|Transmutation]] carried out on purpose, over time, on one piece of a life. Circulation moves Current. Refinement changes what the registers are made of. You take a real pattern and pass it through the Triad until it spends less [[charge|Charge]] and tells fewer lies.",
    mechanics: [
      "Choose one matter. A refinement of everything is a refinement of nothing.",
      "Separate it. What part is store, what part is weather, what part is a story about who you are? Separation is the solve.",
      "Give it a clean expenditure. The Charge that funded the pattern is spent, deliberately, on the conduct the knowing requires. That is the coagula.",
      "Repeat on the same matter until the change shows up in an hour you did not schedule for practice.",
      "Do not open a second matter because the first has become humiliating. Humiliation is often the blackening. It is a gate, not a reason to change studies.",
    ],
    equivalenciesExplanation:
      "This is the greater work as distinct from the lesser circulation. Neidan’s three refinements are its curriculum. Alchemy’s repeated distillation is its rhythm. Qabalistic path-work, when it is more than a guided fantasy, is a map of which conversion is being attempted. Refinement differs from [[circulation|Circulation]] as cooking differs from stirring. Stirring is sometimes what the pot needs. Cooking is a change in the food. The theory of the change is [[transmutation|Transmutation]]. This page is the decision to apply it to a specific knot.",
    infographicType: "flowchart",
    relatedTermIds: ["transmutation", "circulation", "mind-will", "the-return", "conservation"],
    tags: [
      "greater work",
      "three refinements",
      "opus",
      "solve",
      "coagula",
      "purification",
      "distillation",
      "pathworking",
    ],
    registers: ["charge", "current", "mind"],
    applications: [
      "Write the matter in one sentence with a verb of expenditure. “I spend my evenings proving I was wronged.” Not “I have a block.”",
      "Separate it once, on paper, into Charge, Current, and story. Work only that.",
      "Review after a month by the unscheduled hour, not by the quality of the sittings.",
    ],
    traditions: {
      daoist: {
        heading: "Which refinement is actually due",
        paragraphs: [
          "Refining essence into breath is not a picture of a liquid becoming a gas. It is a lived shift: a particular hunger stops raiding the store, and stable warmth and a longer fuse appear in its place. Refining breath into spirit is the further shift in which that warmth stops being interesting for itself and presence gets quieter. Refining spirit into openness is the shift in which even that presence is not clutched.",
          "Most people who believe they are on the third refinement are avoiding a concrete leak named under [[conservation|Conservation]]. The Daoist order is a mercy. It tells you which humility is due. Pick the pattern that costs the most jing. That is your matter. Work it until the cost drops without a pose.",
        ],
      },
      hermetic: {
        heading: "Keep one sample in the flask",
        paragraphs: [
          "A Hermetic refinement often fails socially before it fails spiritually. The operator talks about the lead, swaps it for a more interesting lead, reads another book about lead, and never lets the heat stay on one sample long enough to blacken it. Blackening is supposed to be ugly. The old fusion comes apart before a new one is trustworthy.",
          "The new coagulation should be observable by someone who loves you and is not impressed by your vocabulary. You spend differently. You do not need the old trigger in order to feel real. You can be ordinary in the place where you used to be dramatic. If none of that is true, the stone is still a speech.",
        ],
      },
      qabalistic: {
        heading: "Give the repair an address",
        paragraphs: [
          "A pattern that lives in Yesod — fantasy, reflexive desire, the rehearsed self-image — is not repaired by a meditation on Kether. It is repaired by telling the truth about the image and by giving Malkuth a different behavior, until a center exists that the image does not own. The Tree is a way of not applying the wrong tool.",
          "You do not refine “the astral” in general. You refine the particular fantasy that empties your week. Specificity is Malkuth’s gift to every higher word. A qabalistic refinement that cannot name the ordinary act it is changing has floated off the Tree.",
        ],
      },
    },
    figure: {
      caption:
        "One matter, three passes. Separate the story from the store. Spend what you recover on the conduct you actually chose. Repeat.",
      flow: "ascend",
      nodes: [
        {
          id: "matter",
          label: "One matter",
          detail: "A pattern with a verb of expenditure. This is the sample in the flask.",
          conceptId: "charge",
        },
        {
          id: "separate",
          label: "Separate",
          detail: "Store, weather, and story pulled apart. The solve.",
          conceptId: "transmutation",
        },
        {
          id: "join",
          label: "Join cleanly",
          detail: "The knowing enters conduct. The coagula. Then the Return can mean something.",
          conceptId: "the-return",
        },
      ],
    },
    readingOrder: 14,
  },
  {
    id: "stillness",
    unifiedTerm: "Stillness",
    subtitle: "Mind/Will when it stops spending itself",
    traditionalTerms: {
      daoist: ["Zuowang", "Sitting and forgetting"],
      hermetic: ["The sealed pause", "Contemplation"],
      qabalistic: ["Ain", "Not camping in Da'at"],
    },
    category: "Practices",
    summary:
      "Stillness is the practice of [[mind-will|Mind/Will]] when it stops hiring itself out to objects. It is not sleep, not a blank stare, and not the suppression of thought. It is presence with nothing added, long enough that [[current|Current]] can settle and [[charge|Charge]] can accumulate without being recruited into a project.",
    mechanics: [
      "Stillness is known by the next hour: a softer body, a fuller reserve, less bargaining. Dissociation is known by the opposite: absence, irritability, and a pride in being empty.",
      "Thoughts will occur. The practice is not to hire them. A hired thought is one you continue because it offers a feeling.",
      "Stillness is the condition of the last refinement, not a trick for skipping the first. A dramatic void in a bankrupt store is just a quiet leak.",
      "Short and genuine beats long and performed. End before you start manufacturing profundity.",
      "Stillness is also how an upper gate is passed. The hunger to arrive cannot get through a door it is charging.",
    ],
    equivalenciesExplanation:
      "Zuowang, sitting and forgetting, is the type-case: sit until the categories you use to manage yourself become unnecessary. The Cloud of Unknowing, though Christian rather than Hermetic, is the contemplative cousin many Hermetic readers already know — a naked intent past the cloud of concepts. This register notes the kinship of office and does not fold that theology into alchemy. Qabalistic practice approaches the same office through the negative veils, through Ain, and through the refusal to camp in Da'at. The theologies are not one religion. The office is shared. Mind/Will clarifies by ceasing to grasp.",
    infographicType: "diagram",
    relatedTermIds: ["mind-will", "refinement", "the-operator", "the-return", "the-gates"],
    tags: [
      "zuowang",
      "sitting and forgetting",
      "wu wei",
      "contemplation",
      "ain",
      "daath",
      "da'at",
      "cloud of unknowing",
      "emptiness",
      "void",
    ],
    registers: ["mind"],
    applications: [
      "Sit ten minutes with no method but waking. Afterward, notice whether the next hour was kinder. Keep the sittings that pass that test.",
      "When you catch yourself performing emptiness, move attention to the weight in the chair. Embodiment is the correction.",
      "Use a little stillness at the end of Circulation and at the start of any Refinement, so the matter is seen before it is worked.",
    ],
    traditions: {
      daoist: {
        heading: "Sitting and forgetting",
        paragraphs: [
          "Forgetting, in the Zhuangzi sense, is not amnesia. It is the dropping of a fixed role — the competent person, the injured person, the person on a spiritual path — so that action can come from something less cramped. Wu wei is what that looks like after you stand up.",
          "In the sit, the instruction is small. Be there. When the mind proposes a judgment of the sitting, do not take the contract. Return to the weight of the body and the fact of being awake. A warm, heavy lower field is a good sign. A floaty absence in the head is a bad one. Daoist stillness stays in [[the-vessel|the Vessel]]. It does not exit upward and call the exit a victory.",
        ],
      },
      hermetic: {
        heading: "Stop poking the matter",
        paragraphs: [
          "Hermetic stillness is the moment the fire is correct and the operator stops adjusting it. Constant adjustment is a form of fear. The art has pauses, sometimes long ones, in which the only instruction is not to open the vessel. Contemplation here is not a second technique added to alchemy. It is alchemy when Mercury has been given nothing new to chase.",
          "The danger is aesthetic emptiness: a taste for the void as an atmosphere, a way of feeling above the coarseness of Salt. That taste is sulphur showing off. Real stillness returns to the matter more willing to be ordinary. If contemplation makes ordinary life feel beneath you, you have been cultivating contempt, and contempt is a busy emotion.",
        ],
      },
      qabalistic: {
        heading: "Do not seize a station",
        paragraphs: [
          "Ain and the unmanifest are not meditation targets in any responsible teaching. They are limits on what the mind may claim. The practical reflection is a sitting in which you do not seize a sephirah as your identity. Da'at is the temptation inside that sitting: to know, to name, to conclude. Leaving the conclusion unmade, while remaining awake and kind, is the qabalistic form of this practice.",
          "Another invocation can be a refusal to let the previous operation land. Stillness after an operation is part of the operation. It is the minute in which Malkuth is allowed to have received what you were eager to send. Give it that minute.",
        ],
      },
    },
    figure: {
      caption:
        "Stillness is not a place above the Triad. It is the Triad with nothing extra being hired. The center is the sitter. The offices remain.",
      nodes: [
        {
          id: "open",
          label: "Nothing added",
          detail: "Presence without a project. The practice itself.",
          conceptId: "stillness",
        },
        {
          id: "mind",
          label: "Mind/Will",
          detail: "The office being clarified, not a blank the person boasts about.",
          conceptId: "mind-will",
        },
        {
          id: "body",
          label: "The weight",
          detail: "Charge, still in the chair. If the body is missing, this is dissociation.",
          conceptId: "charge",
        },
      ],
    },
    readingOrder: 15,
  },
];
