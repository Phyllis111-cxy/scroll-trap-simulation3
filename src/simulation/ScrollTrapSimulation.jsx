import { useState, useCallback, useMemo, useEffect } from "react";

/**
 * selectedInterest keys the feed. Fifteen posts: phase 1 life-first (1–5),
 * phase 2 subtle objects in story (6–9), phase 3 desire / usefulness (10–12),
 * phase 4 gentle optional “view product” (13–15). Reinforcement: likes, saves, view-as-buy.
 */
const INTEREST_META = {
  study: { label: "Study & productivity" },
  fashion: { label: "Fashion & aesthetics" },
  skincare: { label: "Skincare & beauty" },
  lifestyle: { label: "Lifestyle routines" },
};

function card(
  id,
  title,
  category,
  phase,
  hasProductMention,
  promotional,
  price,
  tactic,
  comments,
  extras = {}
) {
  const { listPrice, promoTag } = extras;
  const cardData = {
    id,
    title,
    category,
    phase,
    hasProductMention,
    promotional,
    price,
    tactic,
    comments,
  };
  if (typeof listPrice === "number" && listPrice > price) {
    cardData.listPrice = listPrice;
  }
  if (promoTag && typeof promoTag === "string") {
    cardData.promoTag = promoTag;
  }
  return cardData;
}

/** Display-only pricing for product sheet; checkout still uses `price`. */
function getProductPricing(card) {
  const price = card.price ?? 0;
  const listPrice = card.listPrice;
  const hasCompare =
    typeof listPrice === "number" && listPrice > price && price > 0;
  const saveAmount = hasCompare ? listPrice - price : 0;
  const savePct = hasCompare
    ? Math.max(1, Math.round((saveAmount / listPrice) * 100))
    : 0;
  return {
    price,
    listPrice: hasCompare ? listPrice : null,
    saveAmount,
    savePct,
    hasCompare,
    promoTag: card.promoTag,
  };
}

const FEEDS_BY_INTEREST = {
  study: {
    phase1: [
      card(
        "stu-p1a",
        "Library floor that sounds like nothing until you listen",
        "study",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "mara", text: "instant calm" },
          { user: "jo", text: "the squeaky chair in the back tho" },
        ]
      ),
      card(
        "stu-p1b",
        "Rewriting the same paragraph because it has to feel right",
        "study",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "eli", text: "painfully relatable" },
          { user: "ness", text: "send the paragraph /j" },
        ]
      ),
      card(
        "stu-p1c",
        "Timer running but I’m staring at the wall (honest)",
        "study",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "k_t", text: "we’ve all been the wall" },
          { user: "sam2", text: "mood" },
        ]
      ),
      card(
        "stu-p1d",
        "Night session: one lamp, quiet hallway outside",
        "study",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "bea", text: "this lighting >>>" },
          { user: "ron", text: "go to sleep 😭" },
        ]
      ),
      card(
        "stu-p1e",
        "Index cards everywhere like I planned it (I didn’t)",
        "study",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "liv", text: "organized chaos" },
          { user: "d", text: "the pile is a system" },
        ]
      ),
      card(
        "stu-p1f",
        "Walking off brain fog between chapters",
        "wellness",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "tali", text: "needed this reminder" },
          { user: "mo", text: "real" },
        ]
      ),
      card(
        "stu-p1g",
        "Playlist called ‘focus’ that’s mostly instrumental guilt",
        "study",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "ace", text: "link the playlist" },
          { user: "rhea", text: "instrumental guilt is a genre" },
        ]
      ),
    ],
    phase2: [
      card(
        "stu-p2a",
        "Didn’t realize how much one notes app changed my scatterbrain mornings",
        "apps",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "lin", text: "same app three years" },
          { user: "noah", text: "quiet upgrade" },
        ]
      ),
      card(
        "stu-p2b",
        "That highlighter lived uncapped until I noticed I reach for it first",
        "study",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "ivy", text: "small ritual" },
          { user: "chris", text: "muscle memory" },
        ]
      ),
      card(
        "stu-p2c",
        "The bottle in the corner isn’t the point — until I realize it always is",
        "gadgets",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "miko", text: "hydration lore" },
          { user: "ada", text: "felt that" },
        ]
      ),
      card(
        "stu-p2d",
        "Keyboard I’m used to now; the sound became part of settling in",
        "gadgets",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "jules", text: "weirdly grounding" },
          { user: "t", text: "thock therapy" },
        ]
      ),
      card(
        "stu-p2e",
        "Wrong lamp angle, but my eyes stopped fighting the screen at night",
        "home",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "ren", text: "soft light hits different" },
          { user: "bea", text: "didn’t notice til it was gone" },
        ]
      ),
      card(
        "stu-p2f",
        "Blocking sites felt dramatic until my afternoons stopped evaporating",
        "apps",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "zo", text: "gentle boundary" },
          { user: "omar", text: "baby steps" },
        ]
      ),
      card(
        "stu-p2g",
        "Snoozing the calendar taught me how loud notifications actually are",
        "study",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "kai", text: "noise I didn’t ask for" },
          { user: "syd", text: "same" },
        ]
      ),
    ],
    phase3: [
      card(
        "stu-p3a",
        "This actually makes me feel more organized — one surface for the messy list in my head",
        "study",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "han", text: "clarity is underrated" },
          { user: "p", text: "felt lighter after" },
        ]
      ),
      card(
        "stu-p3b",
        "Headphones aren’t about hype; they’re about not hearing my own restlessness",
        "gadgets",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "mina", text: "instant hush" },
          { user: "leo", text: "needed that" },
        ]
      ),
      card(
        "stu-p3c",
        "Small desk mat — boring — but my coffee stopped doing parkour",
        "home",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "nour", text: "domestic peace" },
          { user: "gray", text: "tiny win" },
        ]
      ),
      card(
        "stu-p3d",
        "Templates slowed my panic week; I’m not “productive,” just less scrambled",
        "study",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "tess", text: "structure without shame" },
          { user: "vic", text: "same energy" },
        ]
      ),
      card(
        "stu-p3e",
        "Bias lighting sounds silly until your eyes stop burning at midnight",
        "gadgets",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "ida", text: "subtle difference" },
          { user: "rob", text: "didn’t expect it" },
        ]
      ),
      card(
        "stu-p3f",
        "Half-used planner still changed how I forgive myself mid-semester",
        "study",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "eli", text: "honest progress" },
          { user: "sam", text: "that’s enough" },
        ]
      ),
      card(
        "stu-p3g",
        "Standing for ten minutes between chapters — back stopped yelling",
        "home",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "j", text: "body remembers" },
          { user: "ria", text: "small hinge" },
        ]
      ),
    ],
    phase4: [
      card(
        "stu-p4a",
        "Focus app I kept after the trial — small monthly, quiet headspace",
        "apps",
        4,
        true,
        true,
        9,
        "soft",
        [
          { user: "han", text: "still on it?" },
          { user: "p", text: "yeah, weirdly" },
        ],
        { listPrice: 12, promoTag: "Intro rate" }
      ),
      card(
        "stu-p4b",
        "Same headphones from older clips — people still ask which pair",
        "gadgets",
        4,
        true,
        true,
        79,
        "soft",
        [
          { user: "mina", text: "comfortable for hours?" },
          { user: "leo", text: "for me yes" },
        ],
        { listPrice: 99, promoTag: "Fan favorite" }
      ),
      card(
        "stu-p4c",
        "Desk mat that stopped the mug slide — simple, stays out of the way",
        "home",
        4,
        true,
        true,
        24,
        "utility",
        [
          { user: "nour", text: "which size" },
          { user: "gray", text: "medium desk gang" },
        ],
        { listPrice: 29, promoTag: "Desk upgrade" }
      ),
      card(
        "stu-p4d",
        "Finals templates a student made — spreadsheets that don’t shame you",
        "study",
        4,
        true,
        true,
        12,
        "soft",
        [
          { user: "tess", text: "gentle structure" },
          { user: "vic", text: "saved mine" },
        ],
        { listPrice: 15, promoTag: "Student pick" }
      ),
      card(
        "stu-p4e",
        "Strip behind the monitor — mostly atmosphere, slightly easier on the eyes",
        "gadgets",
        4,
        true,
        true,
        19,
        "soft",
        [
          { user: "ida", text: "warm or cool?" },
          { user: "rob", text: "warm for me" },
        ],
        { listPrice: 24, promoTag: "Setup bundle" }
      ),
      card(
        "stu-p4f",
        "Planner I don’t fill perfectly — still orients my week",
        "study",
        4,
        true,
        false,
        31,
        "honest",
        [
          { user: "eli", text: "realistic" },
          { user: "sam", text: "same one two years" },
        ],
        { listPrice: 38, promoTag: "Reference" }
      ),
      card(
        "stu-p4g",
        "Converter for standing breaks — nothing flashy, just less stiff",
        "home",
        4,
        true,
        true,
        95,
        "utility",
        [
          { user: "j", text: "stable enough?" },
          { user: "ria", text: "tighten once, fine" },
        ],
        { listPrice: 119, promoTag: "Ergonomics" }
      ),
    ],
  },
  fashion: {
    phase1: [
      card(
        "fas-p1a",
        "Mirror check but the lighting is doing all the work",
        "fashion",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "mara", text: "lighting is the outfit" },
          { user: "jo", text: "facts" },
        ]
      ),
      card(
        "fas-p1b",
        "Thrifting without a plan, just touching fabrics",
        "fashion",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "eli_ok", text: "therapeutic" },
          { user: "ness", text: "the rack shuffle" },
        ]
      ),
      card(
        "fas-p1c",
        "Same jacket three days because weather lied",
        "fashion",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "k_t", text: "weather app owes you money" },
          { user: "sam2", text: "jacket stays on" },
        ]
      ),
      card(
        "fas-p1d",
        "Sidewalk pacing because the fit felt right today",
        "lifestyle",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "bea", text: "the confidence jump" },
          { user: "ron", text: "you ate" },
        ]
      ),
      card(
        "fas-p1e",
        "Laundry day color sort — oddly satisfying, zero glam",
        "home",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "liv", text: "darks pile is a mountain" },
          { user: "d", text: "same" },
        ]
      ),
      card(
        "fas-p1f",
        "Outfit I’d wear if I had somewhere to be (I don’t)",
        "fashion",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "tali", text: "living room runway" },
          { user: "mo", text: "valid" },
        ]
      ),
      card(
        "fas-p1g",
        "Shoelace came undone mid-walk, fixed it like a main character",
        "fashion",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "ace", text: "cinematic" },
          { user: "rhea", text: "slow motion in my head" },
        ]
      ),
    ],
    phase2: [
      card(
        "fas-p2a",
        "Same earrings every GRWM — didn’t realize they became my default calm",
        "fashion",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "lin", text: "signature without trying" },
          { user: "noah", text: "quiet anchor" },
        ]
      ),
      card(
        "fas-p2b",
        "That bag keeps showing up because leaving the house feels lighter with it",
        "fashion",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "ivy", text: "one less decision" },
          { user: "chris", text: "felt that" },
        ]
      ),
      card(
        "fas-p2c",
        "Scuffed sneakers — didn’t expect how much I’d miss them on laundry day",
        "fashion",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "miko", text: "broken in = honest" },
          { user: "ada", text: "same pair energy" },
        ]
      ),
      card(
        "fas-p2d",
        "Belt I bought for structure — stayed for how it finishes a silhouette",
        "fashion",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "jules", text: "small polish" },
          { user: "t", text: "details add up" },
        ]
      ),
      card(
        "fas-p2e",
        "Sunglasses on my head until I forget — then light feels too sharp without them",
        "fashion",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "ren", text: "habit becomes need" },
          { user: "bea", text: "weirdly true" },
        ]
      ),
      card(
        "fas-p2f",
        "Scarf turned security blanket — warmth reads as put-together from far away",
        "fashion",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "zo", text: "soft armor" },
          { user: "omar", text: "cozy counts" },
        ]
      ),
      card(
        "fas-p2g",
        "Denim jacket I’ve outlived trends with — didn’t know I’d rely on the weight of it",
        "fashion",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "kai", text: "layer = mood" },
          { user: "syd", text: "same jacket years" },
        ]
      ),
    ],
    phase3: [
      card(
        "fas-p3a",
        "This actually makes me feel more pulled together — same shoes, fewer second guesses",
        "fashion",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "mina", text: "confidence stack" },
          { user: "leo", text: "low effort high return" },
        ]
      ),
      card(
        "fas-p3b",
        "Jacket that holds heat without bulk — I reach for it before I think",
        "fashion",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "nour", text: "shape holds" },
          { user: "gray", text: "daily driver" },
        ]
      ),
      card(
        "fas-p3c",
        "Jewelry that doesn’t shout — just catches light when I move",
        "fashion",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "tess", text: "quiet shine" },
          { user: "vic", text: "same vibe" },
        ]
      ),
      card(
        "fas-p3d",
        "Ugly-useful belt bag — hands free changed how I move through the day",
        "fashion",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "ida", text: "practical wins" },
          { user: "rob", text: "didn’t expect it" },
        ]
      ),
      card(
        "fas-p3e",
        "Boots that don’t punish walking — my ankles stopped negotiating with me",
        "fashion",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "han", text: "comfort is style" },
          { user: "p", text: "finally" },
        ]
      ),
      card(
        "fas-p3f",
        "Tote that swallows laptop + water without looking like luggage",
        "fashion",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "eli", text: "commute peace" },
          { user: "sam", text: "one bag life" },
        ]
      ),
      card(
        "fas-p3g",
        "Basics that feel like skin — I stopped buying loud prints I won’t wear",
        "fashion",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "j", text: "less noise" },
          { user: "ria", text: "wardrobe exhale" },
        ]
      ),
    ],
    phase4: [
      card(
        "fas-p4a",
        "Same sneakers from older clips — people still ask; linking for anyone curious",
        "fashion",
        4,
        true,
        true,
        68,
        "soft",
        [
          { user: "mina", text: "true to size?" },
          { user: "leo", text: "half up for me" },
        ],
        { listPrice: 85, promoTag: "Restock deal" }
      ),
      card(
        "fas-p4b",
        "Jacket I waited on — nothing flashy, just fits shoulders right",
        "fashion",
        4,
        true,
        true,
        110,
        "soft",
        [
          { user: "nour", text: "heavy or light?" },
          { user: "gray", text: "mid weight" },
        ],
        { listPrice: 139, promoTag: "Seasonal" }
      ),
      card(
        "fas-p4c",
        "Jewelry set I wear weekly — not precious, just pretty in daylight",
        "fashion",
        4,
        true,
        true,
        42,
        "soft",
        [
          { user: "tess", text: "sensitive skin ok?" },
          { user: "vic", text: "fine for me" },
        ],
        { listPrice: 52, promoTag: "Set value" }
      ),
      card(
        "fas-p4d",
        "Running belt for keys and phone — minimal bounce, maximal relief",
        "fashion",
        4,
        true,
        false,
        18,
        "utility",
        [
          { user: "ida", text: "fits big phone?" },
          { user: "rob", text: "pro max yes" },
        ],
        { listPrice: 24, promoTag: "Everyday" }
      ),
      card(
        "fas-p4e",
        "Boots I walk in daily — sharing because friends kept asking which pair",
        "fashion",
        4,
        true,
        true,
        89,
        "soft",
        [
          { user: "han", text: "wide calf?" },
          { user: "p", text: "roomy on me" },
        ],
        { listPrice: 109, promoTag: "Walk-ready" }
      ),
      card(
        "fas-p4f",
        "Tote that carries the laptop without the shoulder ache",
        "fashion",
        4,
        true,
        true,
        36,
        "soft",
        [
          { user: "eli", text: "strap width?" },
          { user: "sam", text: "wide enough" },
        ],
        { listPrice: 45, promoTag: "Carry comfort" }
      ),
      card(
        "fas-p4g",
        "Three-pack tees — soft cotton, nothing viral, just rotation I trust",
        "fashion",
        4,
        true,
        true,
        45,
        "bundle",
        [
          { user: "j", text: "shrink?" },
          { user: "ria", text: "cold wash" },
        ],
        { listPrice: 58, promoTag: "3-pack" }
      ),
    ],
  },
  skincare: {
    phase1: [
      card(
        "ski-p1a",
        "Face still damp from the shower, no routine talk",
        "skincare",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "mara", text: "skin looks calm" },
          { user: "jo", text: "humidity era" },
        ]
      ),
      card(
        "ski-p1b",
        "Hair tucked back with whatever was on the counter",
        "beauty",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "eli_ok", text: "relatable" },
          { user: "ness", text: "the mystery clip" },
        ]
      ),
      card(
        "ski-p1c",
        "Bathroom steam + one window cracked open",
        "skincare",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "k_t", text: "spa coded" },
          { user: "sam2", text: "peace" },
        ]
      ),
      card(
        "ski-p1d",
        "Washing hands way too long because the water temperature is perfect",
        "skincare",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "bea", text: "you’re not alone" },
          { user: "ron", text: "therapy" },
        ]
      ),
      card(
        "ski-p1e",
        "Mirror smudge I keep not cleaning",
        "home",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "liv", text: "character" },
          { user: "d", text: "aesthetic smudge" },
        ]
      ),
      card(
        "ski-p1f",
        "Towel on the hook that never dries fully (winter problem)",
        "skincare",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "tali", text: "winter is personal" },
          { user: "mo", text: "facts" },
        ]
      ),
      card(
        "ski-p1g",
        "Lighting so yellow it’s honest, not flattering",
        "skincare",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "ace", text: "honest king" },
          { user: "rhea", text: "we love honesty" },
        ]
      ),
    ],
    phase2: [
      card(
        "ski-p2a",
        "Lip balm in every jacket — didn’t realize how much I cue calm from the same tube",
        "beauty",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "lin", text: "tiny ritual" },
          { user: "noah", text: "muscle memory" },
        ]
      ),
      card(
        "ski-p2b",
        "Sink lineup isn’t a review — just proof I’m gentler with nights now",
        "skincare",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "ivy", text: "softened my evenings" },
          { user: "chris", text: "same" },
        ]
      ),
      card(
        "ski-p2c",
        "SPF in the car (passenger) — reapply felt dramatic until burn stopped winning",
        "skincare",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "miko", text: "quiet discipline" },
          { user: "ada", text: "future you says thanks" },
        ]
      ),
      card(
        "ski-p2d",
        "Mask packet in the drawer — forgot I bought it, then my skin thanked the pause",
        "skincare",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "jules", text: "slow reward" },
          { user: "t", text: "felt that" },
        ]
      ),
      card(
        "ski-p2e",
        "Hand cream by the keyboard — winter stopped feeling like punishment",
        "beauty",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "ren", text: "small comfort" },
          { user: "bea", text: "underrated" },
        ]
      ),
      card(
        "ski-p2f",
        "Cotton pad pile — procrastination that still ends in care",
        "skincare",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "zo", text: "gentle delay" },
          { user: "omar", text: "still counts" },
        ]
      ),
      card(
        "ski-p2g",
        "Hair oil on ends only — didn’t expect how much less I’d touch breakage",
        "beauty",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "kai", text: "patience pays" },
          { user: "syd", text: "ends behave" },
        ]
      ),
    ],
    phase3: [
      card(
        "ski-p3a",
        "This actually makes me feel more cared for — serum layer that doesn’t fight my skin",
        "skincare",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "mina", text: "barrier feels calmer" },
          { user: "leo", text: "less reactive" },
        ]
      ),
      card(
        "ski-p3b",
        "LED mask might be placebo — I still exhale when the timer starts",
        "skincare",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "nour", text: "ritual > science sometimes" },
          { user: "gray", text: "honest" },
        ]
      ),
      card(
        "ski-p3c",
        "SPF isn’t glam — it’s the step that makes the rest feel less anxious",
        "skincare",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "tess", text: "prevention mindset" },
          { user: "vic", text: "quiet win" },
        ]
      ),
      card(
        "ski-p3d",
        "Cleansing balm turned removal into something I don’t rush",
        "skincare",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "ida", text: "melts stress too" },
          { user: "rob", text: "same" },
        ]
      ),
      card(
        "ski-p3e",
        "Overnight lip treatment — woke up softer, not performing for anyone",
        "beauty",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "han", text: "small repair" },
          { user: "p", text: "felt necessary" },
        ]
      ),
      card(
        "ski-p3f",
        "Gua sha cold on cheeks — puff eases before I’ve said a word",
        "skincare",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "eli", text: "two minutes peace" },
          { user: "sam", text: "morning reset" },
        ]
      ),
      card(
        "ski-p3g",
        "Vitamin C slow-brightened dull weeks — patience became part of the glow",
        "skincare",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "j", text: "patch test always" },
          { user: "ria", text: "stored in dark" },
        ]
      ),
    ],
    phase4: [
      card(
        "ski-p4a",
        "Serum I’ve repurchased twice — gentle on my reactive skin",
        "skincare",
        4,
        true,
        true,
        28,
        "soft",
        [
          { user: "mina", text: "fragrance?" },
          { user: "leo", text: "barely there" },
        ],
        { listPrice: 36, promoTag: "Repurchase" }
      ),
      card(
        "ski-p4b",
        "LED mask I use when the day won’t unclench — ritual more than miracle",
        "skincare",
        4,
        true,
        true,
        49,
        "soft",
        [
          { user: "nour", text: "how often" },
          { user: "gray", text: "when I remember" },
        ],
        { listPrice: 65, promoTag: "Ritual kit" }
      ),
      card(
        "ski-p4c",
        "SPF duo I actually finish — two tubes, year-long habit",
        "skincare",
        4,
        true,
        true,
        34,
        "bundle",
        [
          { user: "tess", text: "white cast?" },
          { user: "vic", text: "light on me" },
        ],
        { listPrice: 44, promoTag: "Duo deal" }
      ),
      card(
        "ski-p4d",
        "Cleansing balm that melts day off — oil doing quiet work",
        "skincare",
        4,
        true,
        true,
        22,
        "soft",
        [
          { user: "ida", text: "eyes?" },
          { user: "rob", text: "keep closed" },
        ],
        { listPrice: 28, promoTag: "Double cleanse" }
      ),
      card(
        "ski-p4e",
        "Overnight lip treatment — less crusty, more honest morning",
        "beauty",
        4,
        true,
        true,
        14,
        "honest",
        [
          { user: "han", text: "texture?" },
          { user: "p", text: "a little tacky" },
        ],
        { listPrice: 19, promoTag: "PM care" }
      ),
      card(
        "ski-p4f",
        "Gua sha — cold stone, face less puffy, two minutes I guard",
        "skincare",
        4,
        true,
        false,
        16,
        "utility",
        [
          { user: "eli", text: "technique tips?" },
          { user: "sam", text: "light pressure" },
        ],
        { listPrice: 22, promoTag: "Tool" }
      ),
      card(
        "ski-p4g",
        "Vitamin C I patch-tested — slow glow, store away from sun",
        "skincare",
        4,
        true,
        true,
        19,
        "soft",
        [
          { user: "j", text: "oxidize fast?" },
          { user: "ria", text: "cap tight" },
        ],
        { listPrice: 26, promoTag: "Brightening" }
      ),
    ],
  },
  lifestyle: {
    phase1: [
      card(
        "life-p1a",
        "Morning light on the counter, kettle not boiled yet",
        "lifestyle",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "mara", text: "soft start" },
          { user: "jo", text: "patience" },
        ]
      ),
      card(
        "life-p1b",
        "Making toast badly on purpose (it still tastes fine)",
        "food",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "eli_ok", text: "toast is toast" },
          { user: "ness", text: "honest" },
        ]
      ),
      card(
        "life-p1c",
        "Watering plants like I know what I’m doing",
        "home",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "k_t", text: "fake it till they grow" },
          { user: "sam2", text: "roots believe" },
        ]
      ),
      card(
        "life-p1d",
        "Bed half-made because I got distracted mid-sheet",
        "lifestyle",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "bea", text: "sheet ghost" },
          { user: "ron", text: "same" },
        ]
      ),
      card(
        "life-p1e",
        "Opening every cabinet before remembering what I needed",
        "home",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "liv", text: "kitchen parkour" },
          { user: "d", text: "it was the scissors" },
        ]
      ),
      card(
        "life-p1f",
        "Evening walk with no podcast, just neighborhood noise",
        "lifestyle",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "tali", text: "underrated" },
          { user: "mo", text: "noise is the episode" },
        ]
      ),
      card(
        "life-p1g",
        "Fridge hum ASMR if you listen long enough",
        "home",
        1,
        false,
        false,
        0,
        "none",
        [
          { user: "ace", text: "sentient fridge" },
          { user: "rhea", text: "I hear it now" },
        ]
      ),
    ],
    phase2: [
      card(
        "life-p2a",
        "This mug drifted into my hand every morning — didn’t notice it became the ritual",
        "home",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "lin", text: "first sip energy" },
          { user: "noah", text: "same mug months" },
        ]
      ),
      card(
        "life-p2b",
        "Old pan in every cooking clip — didn’t realize how much I trust the patina",
        "home",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "ivy", text: "seasoned = honest" },
          { user: "chris", text: "flavor memory" },
        ]
      ),
      card(
        "life-p2c",
        "Candle in the corner — not the subject, until the room felt empty without it",
        "home",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "miko", text: "scent anchors" },
          { user: "ada", text: "soft signal" },
        ]
      ),
      card(
        "life-p2d",
        "Blanket that’s half pet — didn’t expect how much cozier the mess feels",
        "lifestyle",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "jules", text: "warmth > perfect" },
          { user: "t", text: "same" },
        ]
      ),
      card(
        "life-p2e",
        "Bottle always in frame — carrying water stopped being a chore",
        "wellness",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "ren", text: "hydration loop" },
          { user: "bea", text: "unconscious now" },
        ]
      ),
      card(
        "life-p2f",
        "Peeling soap label — domestic noise that somehow calms the kitchen",
        "home",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "zo", text: "lived-in" },
          { user: "omar", text: "real life texture" },
        ]
      ),
      card(
        "life-p2g",
        "Meal prep stacks — didn’t think I’d miss the rhythm when I skipped a week",
        "food",
        2,
        true,
        false,
        0,
        "embed",
        [
          { user: "kai", text: "structure sneaks in" },
          { user: "syd", text: "felt the difference" },
        ]
      ),
    ],
    phase3: [
      card(
        "life-p3a",
        "This actually makes me feel more held — coffee stays warm through slow mornings",
        "gadgets",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "mina", text: "small luxury" },
          { user: "leo", text: "gentle pace" },
        ]
      ),
      card(
        "life-p3b",
        "Plants arriving monthly — responsibility that feels like decoration",
        "home",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "nour", text: "green quiet" },
          { user: "gray", text: "room breathes" },
        ]
      ),
      card(
        "life-p3c",
        "Air fryer I resisted — weeknights got shorter, not fancier",
        "home",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "tess", text: "less decision fatigue" },
          { user: "vic", text: "same" },
        ]
      ),
      card(
        "life-p3d",
        "Candles after sunset — winter got less sharp without trying harder",
        "home",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "ida", text: "light as care" },
          { user: "rob", text: "felt necessary" },
        ]
      ),
      card(
        "life-p3e",
        "Meal kit on heavy weeks — cooking became possible instead of impressive",
        "food",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "han", text: "permission to be tired" },
          { user: "p", text: "same" },
        ]
      ),
      card(
        "life-p3f",
        "Robot vacuum — floor half-clean feels kinder than perfect avoidance",
        "home",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "eli", text: "good enough help" },
          { user: "sam", text: "less guilt" },
        ]
      ),
      card(
        "life-p3g",
        "Mat by the kettle — sixty seconds of stretch became non-negotiable",
        "wellness",
        3,
        true,
        false,
        0,
        "desire",
        [
          { user: "j", text: "micro reset" },
          { user: "ria", text: "body thanks you" },
        ]
      ),
    ],
    phase4: [
      card(
        "life-p4a",
        "Mug that keeps coffee warm — quiet upgrade for slow starters",
        "gadgets",
        4,
        true,
        true,
        34,
        "soft",
        [
          { user: "mina", text: "charge often?" },
          { user: "leo", text: "morning to lunch" },
        ],
        { listPrice: 44, promoTag: "Morning ritual" }
      ),
      card(
        "life-p4b",
        "Plant box — first month gentle, skip anytime if life gets loud",
        "home",
        4,
        true,
        true,
        27,
        "soft",
        [
          { user: "nour", text: "pet safe?" },
          { user: "gray", text: "check list" },
        ],
        { listPrice: 35, promoTag: "First box" }
      ),
      card(
        "life-p4c",
        "Air fryer I use most nights — nothing chef-y, just fewer decisions",
        "home",
        4,
        true,
        true,
        89,
        "honest",
        [
          { user: "tess", text: "noise ok?" },
          { user: "vic", text: "kitchen fine" },
        ],
        { listPrice: 115, promoTag: "Kitchen staple" }
      ),
      card(
        "life-p4d",
        "Candle pair — winter scent, sharing because friends kept asking",
        "home",
        4,
        true,
        true,
        26,
        "soft",
        [
          { user: "ida", text: "throw or jar" },
          { user: "rob", text: "jar" },
        ],
        { listPrice: 32, promoTag: "Pair deal" }
      ),
      card(
        "life-p4e",
        "Meal kit for heavy weeks — portions worked for two here",
        "food",
        4,
        true,
        true,
        39,
        "soft",
        [
          { user: "han", text: "flexible?" },
          { user: "p", text: "skip weeks" },
        ],
        { listPrice: 49, promoTag: "Weekly box" }
      ),
      card(
        "life-p4f",
        "Refurb vacuum — middle of floor handled, corners still human",
        "home",
        4,
        true,
        false,
        129,
        "utility",
        [
          { user: "eli", text: "gets stuck?" },
          { user: "sam", text: "rarely" },
        ],
        { listPrice: 169, promoTag: "Refurb" }
      ),
      card(
        "life-p4g",
        "Mat for stretches while water boils — low drama, high relief",
        "wellness",
        4,
        true,
        true,
        32,
        "honest",
        [
          { user: "j", text: "grip ok?" },
          { user: "ria", text: "fine barefoot" },
        ],
        { listPrice: 42, promoTag: "Stretch" }
      ),
    ],
  },
};

/** Warm, lifestyle-first copy for the product sheet (phase 4). */
const PRODUCT_PAGE_COPY = {
  "stu-p4a": {
    headline: "A softer place to begin",
    feeling:
      "Opening it feels like clearing mental clutter—small, steady, and kinder than a fresh tab.",
  },
  "stu-p4b": {
    headline: "Sound that holds your focus",
    feeling:
      "The world narrows to one track; your shoulders drop before you’ve named why.",
  },
  "stu-p4c": {
    headline: "Stillness for your mug",
    feeling:
      "No more tiny slides across the desk—just a calm landing for your hands between thoughts.",
  },
  "stu-p4d": {
    headline: "Structure without shame",
    feeling:
      "Spreadsheets that whisper enough for today instead of demanding a perfect semester.",
  },
  "stu-p4e": {
    headline: "Warmth at the edge of the screen",
    feeling:
      "The glow softens midnight tabs; your eyes stop flinching before you notice.",
  },
  "stu-p4f": {
    headline: "Honest weeks on paper",
    feeling:
      "Half-filled boxes still tell the truth: you kept showing up in pencil.",
  },
  "stu-p4g": {
    headline: "Stand, stretch, breathe",
    feeling:
      "A few inches higher and your spine remembers it’s allowed to let go.",
  },
  "fas-p4a": {
    headline: "Steps that feel like yours",
    feeling:
      "Broken-in comfort—same pair, same sidewalk, less second-guessing at the door.",
  },
  "fas-p4b": {
    headline: "Shoulders that finally rest",
    feeling:
      "The weight sits right; you stop adjusting every block like something’s wrong.",
  },
  "fas-p4c": {
    headline: "Light that follows you",
    feeling:
      "Quiet shine for ordinary daylight—pretty without asking for an audience.",
  },
  "fas-p4d": {
    headline: "Hands free, mind lighter",
    feeling:
      "Keys and phone tucked away; walking stops feeling like juggling.",
  },
  "fas-p4e": {
    headline: "Miles without negotiation",
    feeling:
      "Ankles stop bargaining with you—pavement becomes something you can stay on.",
  },
  "fas-p4f": {
    headline: "Carry day without the ache",
    feeling:
      "Laptop, water, the small chaos—held without the shoulder drama.",
  },
  "fas-p4g": {
    headline: "Soft rotation you trust",
    feeling:
      "Nothing viral—just cotton that forgives Monday and Tuesday and the repeat.",
  },
  "ski-p4a": {
    headline: "Skin that stops flinching",
    feeling:
      "A serum that meets you gently—reactive days feel a little less loud.",
  },
  "ski-p4b": {
    headline: "Light when the day won’t unclench",
    feeling:
      "The timer starts and you exhale—ritual before miracle, honesty before hype.",
  },
  "ski-p4c": {
    headline: "Sun care you actually finish",
    feeling:
      "Two tubes, a year of small promises kept—prevention that feels like self-respect.",
  },
  "ski-p4d": {
    headline: "Melting the day away",
    feeling:
      "Oil doing quiet work—removal becomes something you don’t rush through.",
  },
  "ski-p4e": {
    headline: "Mornings a little softer",
    feeling:
      "Less crusty, more honest—lips that feel tended, not displayed.",
  },
  "ski-p4f": {
    headline: "Two minutes, cooler cheeks",
    feeling:
      "Stone on skin, puff eases before you’ve said a word out loud.",
  },
  "ski-p4g": {
    headline: "Patience in a bottle",
    feeling:
      "Slow brightening for dull weeks—glow as something you grow, not grab.",
  },
  "life-p4a": {
    headline: "Warmth that waits for you",
    feeling:
      "Coffee stays kind through slow mornings—no performance, just a gentler start.",
  },
  "life-p4b": {
    headline: "Green that doesn’t guilt you",
    feeling:
      "First month gentle; if life gets loud, you can pause without shame.",
  },
  "life-p4c": {
    headline: "Fewer decisions at dinner",
    feeling:
      "Nothing chef-y—just a rhythm that makes the kitchen feel less like a test.",
  },
  "life-p4d": {
    headline: "Scent that holds winter",
    feeling:
      "A small flame, a shared question—cozy without a sales pitch.",
  },
  "life-p4e": {
    headline: "Heavy weeks, simpler plates",
    feeling:
      "Portions that fit real life—flex when you need air, structure when you don’t.",
  },
  "life-p4f": {
    headline: "Floors that meet you halfway",
    feeling:
      "Middle of the room handled; corners stay human—good enough, kindly.",
  },
  "life-p4g": {
    headline: "Stretch while the kettle hums",
    feeling:
      "Low drama, high relief—your body gets a minute before the next thing.",
  },
};

function productPageMoment(card) {
  const row = PRODUCT_PAGE_COPY[card.id];
  if (row) return row;
  const headline =
    (card.title && card.title.split("—")[0]?.trim()) || card.title || "This moment";
  return {
    headline,
    feeling:
      "Something about how it fits an ordinary day—no performance, just a little more ease.",
  };
}

const INITIAL_WALLET = 200;
const INTERACTIONS_TO_END = 15;

function phaseForPostIndex(postIndex) {
  if (postIndex < 5) return 1;
  if (postIndex < 9) return 2;
  if (postIndex < 12) return 3;
  return 4;
}

function poolForPostIndex(postIndex, interestId) {
  const feed = FEEDS_BY_INTEREST[interestId];
  if (!feed) return FEEDS_BY_INTEREST.study.phase1;
  const p = phaseForPostIndex(postIndex);
  if (p === 1) return feed.phase1;
  if (p === 2) return feed.phase2;
  if (p === 3) return feed.phase3;
  return feed.phase4;
}

function fallbackCard(interestId) {
  return poolForPostIndex(0, interestId)[0];
}

const THUMBNAIL_URLS = [
  "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511988617509-a557efe70483?auto=format&w=400&h=700&fit=crop&q=80",
  "https://images.unsplash.com/photo-1476480862121-209137aa3318?auto=format&w=400&h=700&fit=crop&q=80",
];

function thumbnailUrlForCard(card) {
  let h = 0;
  for (let i = 0; i < card.id.length; i++) {
    h = (h * 31 + card.id.charCodeAt(i)) | 0;
  }
  return THUMBNAIL_URLS[Math.abs(h) % THUMBNAIL_URLS.length];
}

function pickWeightedCard(
  adIntensity,
  categoryAffinity,
  excludeId,
  postIndex,
  interestId
) {
  const basePool = poolForPostIndex(postIndex, interestId);
  if (basePool.length === 0) return fallbackCard(interestId);

  if (phaseForPostIndex(postIndex) < 4) {
    return weightedPickInPool(basePool, categoryAffinity, excludeId);
  }

  const promoItems = basePool.filter((c) => c.promotional);
  const organicItems = basePool.filter((c) => !c.promotional);
  const promoChance = Math.min(0.88, 0.22 + adIntensity * 0.07);
  const pool =
    organicItems.length === 0
      ? promoItems
      : promoItems.length === 0
        ? organicItems
        : Math.random() < promoChance
          ? promoItems
          : organicItems;

  return weightedPickInPool(pool, categoryAffinity, excludeId);
}

function weightedPickInPool(pool, categoryAffinity, excludeId) {
  const weights = pool.map((item) => {
    const aff = categoryAffinity[item.category] ?? 0;
    const affinityBoost = 1 + aff * 0.55;
    return affinityBoost;
  });

  let total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0 && pool[i].id !== excludeId) return pool[i];
    if (r <= 0) break;
  }

  const candidates = pool.filter((c) => c.id !== excludeId);
  return (
    candidates[Math.floor(Math.random() * Math.max(1, candidates.length))] ??
    pool[0]
  );
}

function buildConsumptionProfile({
  totalSpent,
  adIntensity,
  purchaseCount,
  likeCount,
  skipCount,
  saveCount,
}) {
  const parts = [];

  if (purchaseCount >= 4) {
    parts.push(
      "Several gentle choices in one sitting—each one something a real feed might remember."
    );
  } else if (purchaseCount === 0) {
    parts.push("No checkout this round—only what you looked at and what you saved.");
  } else {
    parts.push("A few choices landed—enough to notice preference without a single story.");
  }

  if (adIntensity >= 20) {
    parts.push(
      "Your signals stacked softly; many apps would read that as ‘more like this, please.’"
    );
  } else if (adIntensity <= 6) {
    parts.push(
      "A lighter touch—less for an algorithm to hold onto, in a good way."
    );
  } else {
    parts.push(
      "Enough warmth in your taps for a feed to sense where your eyes rested."
    );
  }

  if (likeCount > skipCount * 1.5) {
    parts.push("Likes led the way—often interpreted as openness to similar moments.");
  } else if (skipCount > likeCount * 1.5) {
    parts.push("Skips carried more of the session—that shapes a different kind of suggestion.");
  }

  if (saveCount >= 4) {
    parts.push("Saves piled up quietly—many systems treat that like a gentle ‘not done yet.’");
  }

  if (totalSpent > 120) {
    parts.push("What moved from maybe to yes added up—worth noticing without judgment.");
  }

  return parts.join(" ");
}

const INTEREST_ORDER = ["study", "fashion", "skincare", "lifestyle"];

const SUMMARY_SLIDE_COUNT = 6;

/** Hidden from UI; shapes reflective copy only. */
function determineReflectionPath({
  totalSaves,
  totalBuys,
  firstBuySlotIndex,
}) {
  if (totalBuys === 0 && totalSaves === 0) return "observer";
  if (totalBuys === 0 && totalSaves > 0) return "curious";
  if (totalBuys > 0 && firstBuySlotIndex !== null) {
    if (firstBuySlotIndex < 8) return "fastShift";
    return "gradual";
  }
  if (totalBuys > 0) return "gradual";
  return "observer";
}

function buildPathSummaryStrings(path, interestLabel) {
  const slide0Headline = `You started with ${interestLabel}—based inspiration.`;
  const slide1Muted =
    "Product moments arrived in layers—quiet at first, then easier to notice.";
  const slide2PathLine = {
    observer:
      "You moved with a light grip—looking more than grabbing. Attention still travels, even quietly.",
    curious:
      "You saved what resonated without needing to take it home yet. Curiosity is its own kind of momentum.",
    gradual:
      "When you chose something, it often came after the story had time to settle.",
    fastShift:
      "Something met you earlier in the scroll. Pull can land before we’ve named what we’re feeling.",
  }[path];
  const slide3PathLine = {
    observer:
      "What you pause on and what gets shown next borrow from each other. Neither is fixed alone.",
    curious:
      "Bookmarks tell a story too—often read as ‘maybe later,’ sometimes as ‘more like this.’",
    gradual:
      "A slower arc can give desire room to clarify before anything is decided.",
    fastShift:
      "When the loop tightens sooner, it usually reflects how these systems respond to early signals—not a verdict on you.",
  }[path];
  const slide4Question = {
    observer: "What helped you pause?",
    curious: "When did interest begin to feel necessary?",
    gradual: "What made it feel aligned?",
    fastShift: "What arrived before you were ready to name it?",
  }[path];
  const slide3Amplify = slide3PathLine;
  return {
    slide0Headline,
    slide0Muted: "A small reflection—not a verdict.",
    slide1Muted,
    slide2PathLine,
    slide3LineA: "Your interests shaped the feed.",
    slide3LineB: "The feed shaped your interests.",
    slide3Amplify,
    slide4Question,
    slide5LineA: "Scrolling shapes desire.",
    slide5LineB: "Awareness softens it.",
    slide5LineC: "Notice what feels necessary.",
  };
}

export default function ScrollTrapSimulation() {
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [wallet, setWallet] = useState(INITIAL_WALLET);
  const [adIntensity, setAdIntensity] = useState(0);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);
  const [categoryAffinity, setCategoryAffinity] = useState({});
  const [currentCard, setCurrentCard] = useState(null);
  const [finished, setFinished] = useState(false);
  const [summarySlideIndex, setSummarySlideIndex] = useState(0);
  const [reflectionInput, setReflectionInput] = useState("");
  const [firstProductInteractionIndex, setFirstProductInteractionIndex] =
    useState(null);
  const [firstBuySlotIndex, setFirstBuySlotIndex] = useState(null);
  const [productPageOpen, setProductPageOpen] = useState(false);

  useEffect(() => {
    if (finished) {
      setSummarySlideIndex(0);
      setReflectionInput("");
    }
  }, [finished]);

  useEffect(() => {
    if (!finished) return;
    const onKey = (e) => {
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement
      ) {
        return;
      }
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        if (summarySlideIndex < SUMMARY_SLIDE_COUNT - 1) {
          setSummarySlideIndex((i) => i + 1);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSummarySlideIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, summarySlideIndex]);

  useEffect(() => {
    if (!productPageOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setProductPageOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [productPageOpen]);

  const tryFinishOrAdvanceCard = useCallback(
    (nextInteraction, nextIntensity, nextAffinity) => {
      if (!selectedInterest) return;
      if (nextInteraction >= INTERACTIONS_TO_END) {
        setFinished(true);
        return;
      }
      setCurrentCard((prev) =>
        pickWeightedCard(
          nextIntensity,
          nextAffinity,
          prev?.id ?? null,
          nextInteraction,
          selectedInterest
        )
      );
    },
    [selectedInterest]
  );

  const startSession = useCallback((id) => {
    setSelectedInterest(id);
    setWallet(INITIAL_WALLET);
    setAdIntensity(0);
    setPurchaseCount(0);
    setTotalSpent(0);
    setInteractionCount(0);
    setLikeCount(0);
    setSkipCount(0);
    setSaveCount(0);
    setCategoryAffinity({});
    setFinished(false);
    setFirstProductInteractionIndex(null);
    setFirstBuySlotIndex(null);
    setProductPageOpen(false);
    setCurrentCard(pickWeightedCard(0, {}, null, 0, id));
  }, []);

  const handleLike = useCallback(() => {
    if (finished || !selectedInterest) return;
    if (currentCard.phase >= 2) {
      setFirstProductInteractionIndex((prev) =>
        prev === null ? interactionCount : prev
      );
    }
    const nextAffinity = {
      ...categoryAffinity,
      [currentCard.category]: (categoryAffinity[currentCard.category] ?? 0) + 1,
    };
    setCategoryAffinity(nextAffinity);
    setLikeCount((c) => c + 1);
    const nextIntensity = adIntensity + 2;
    setAdIntensity(nextIntensity);
    const nextInteraction = interactionCount + 1;
    setInteractionCount(nextInteraction);
    tryFinishOrAdvanceCard(nextInteraction, nextIntensity, nextAffinity);
  }, [
    finished,
    selectedInterest,
    currentCard,
    interactionCount,
    categoryAffinity,
    adIntensity,
    tryFinishOrAdvanceCard,
  ]);

  const handleSkip = useCallback(() => {
    if (finished || !selectedInterest) return;
    setSkipCount((c) => c + 1);
    const nextInteraction = interactionCount + 1;
    setInteractionCount(nextInteraction);
    tryFinishOrAdvanceCard(nextInteraction, adIntensity, categoryAffinity);
  }, [
    finished,
    selectedInterest,
    currentCard,
    interactionCount,
    adIntensity,
    categoryAffinity,
    tryFinishOrAdvanceCard,
  ]);

  const handleSave = useCallback(() => {
    if (finished || !selectedInterest) return;
    if (currentCard.phase >= 2) {
      setFirstProductInteractionIndex((prev) =>
        prev === null ? interactionCount : prev
      );
    }
    setSaveCount((c) => c + 1);
    const nextIntensity = adIntensity + 1;
    setAdIntensity(nextIntensity);
    const nextInteraction = interactionCount + 1;
    setInteractionCount(nextInteraction);
    tryFinishOrAdvanceCard(nextInteraction, nextIntensity, categoryAffinity);
  }, [
    finished,
    selectedInterest,
    currentCard,
    interactionCount,
    adIntensity,
    categoryAffinity,
    tryFinishOrAdvanceCard,
  ]);

  const handleBuy = useCallback(() => {
    if (finished || !selectedInterest) return;
    if (currentCard.phase !== 4) return;
    if (currentCard.price <= 0 || currentCard.price > wallet) return;

    setProductPageOpen(false);

    if (currentCard.phase >= 2) {
      setFirstProductInteractionIndex((prev) =>
        prev === null ? interactionCount : prev
      );
    }
    setFirstBuySlotIndex((prev) => (prev === null ? interactionCount : prev));
    setWallet((w) => w - currentCard.price);
    setTotalSpent((t) => t + currentCard.price);
    setPurchaseCount((p) => p + 1);
    const nextIntensity = adIntensity + 3;
    setAdIntensity(nextIntensity);
    const nextInteraction = interactionCount + 1;
    setInteractionCount(nextInteraction);
    tryFinishOrAdvanceCard(nextInteraction, nextIntensity, categoryAffinity);
  }, [
    finished,
    selectedInterest,
    currentCard,
    interactionCount,
    wallet,
    adIntensity,
    categoryAffinity,
    tryFinishOrAdvanceCard,
  ]);

  const handleRestart = useCallback(() => {
    setSelectedInterest(null);
    setWallet(INITIAL_WALLET);
    setAdIntensity(0);
    setPurchaseCount(0);
    setTotalSpent(0);
    setInteractionCount(0);
    setLikeCount(0);
    setSkipCount(0);
    setSaveCount(0);
    setCategoryAffinity({});
    setFinished(false);
    setCurrentCard(null);
    setFirstProductInteractionIndex(null);
    setFirstBuySlotIndex(null);
    setProductPageOpen(false);
    setSummarySlideIndex(0);
    setReflectionInput("");
  }, []);

  const goNextSummarySlide = useCallback(() => {
    setSummarySlideIndex((i) => Math.min(i + 1, SUMMARY_SLIDE_COUNT - 1));
  }, []);

  const goPrevSummarySlide = useCallback(() => {
    setSummarySlideIndex((i) => Math.max(i - 1, 0));
  }, []);

  const profileMessage = useMemo(
    () =>
      buildConsumptionProfile({
        totalSpent,
        adIntensity,
        purchaseCount,
        likeCount,
        skipCount,
        saveCount,
      }),
    [totalSpent, adIntensity, purchaseCount, likeCount, skipCount, saveCount]
  );

  const interestLabel = selectedInterest
    ? INTEREST_META[selectedInterest].label
    : "";
  const reflectionPath = useMemo(
    () =>
      determineReflectionPath({
        totalSaves: saveCount,
        totalBuys: purchaseCount,
        firstBuySlotIndex,
      }),
    [saveCount, purchaseCount, firstBuySlotIndex]
  );

  const pathStrings = useMemo(
    () => buildPathSummaryStrings(reflectionPath, interestLabel || "what you chose"),
    [reflectionPath, interestLabel]
  );

  const isLastSummarySlide = summarySlideIndex === SUMMARY_SLIDE_COUNT - 1;

  const phase = currentCard?.phase ?? 1;
  const showSave = phase >= 2;
  const showCommerceChrome = phase === 4;
  const canBuy =
    showCommerceChrome &&
    currentCard &&
    currentCard.phase === 4 &&
    currentCard.price > 0 &&
    wallet >= currentCard.price;

  let railClass = "action-rail";
  if (showCommerceChrome) railClass += " action-rail--four";
  else if (showSave) railClass += " action-rail--three";
  else railClass += " action-rail--two";

  if (selectedInterest === null) {
    return (
      <div className="app-shell">
        <div className="phone">
          <div className="interest-screen">
            <p className="brand-tiny">Reflective scroll</p>
            <h1 className="interest-title">What usually catches your attention?</h1>
            <p className="interest-sub">
              Choose what feels closest. The next moments lean that direction—the
              way attention quietly builds a world around you.
            </p>
            <ul className="interest-list" role="list">
              {INTEREST_ORDER.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    className="interest-option"
                    onClick={() => startSession(id)}
                  >
                    {INTEREST_META[id].label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="app-shell app-shell--summary">
        <div className="phone phone--summary">
          <div className="summary-deck">
            <p className="summary-brand">In review</p>
            <div
              key={summarySlideIndex}
              className="summary-slide summary-slide-anim"
              role="group"
              aria-label={`Summary slide ${summarySlideIndex + 1} of ${SUMMARY_SLIDE_COUNT}`}
            >
              {summarySlideIndex === 0 && (
                <>
                  <p className="summary-eyebrow">Where you began</p>
                  <h2 className="summary-headline">{pathStrings.slide0Headline}</h2>
                  <p className="summary-muted">{pathStrings.slide0Muted}</p>
                </>
              )}
              {summarySlideIndex === 1 && (
                <>
                  <p className="summary-eyebrow">What shifted</p>
                  <div className="summary-phase-bar" aria-hidden>
                    <div className="summary-phase-bar__track">
                      <div
                        className="summary-phase-bar__chunk summary-phase-bar__chunk--1"
                        style={{ flex: 5 }}
                      />
                      <div
                        className="summary-phase-bar__chunk summary-phase-bar__chunk--2"
                        style={{ flex: 4 }}
                      />
                      <div
                        className="summary-phase-bar__chunk summary-phase-bar__chunk--3"
                        style={{ flex: 3 }}
                      />
                      <div
                        className="summary-phase-bar__chunk summary-phase-bar__chunk--4"
                        style={{ flex: 3 }}
                      />
                    </div>
                    <div className="summary-phase-bar__labels">
                      <span>Life</span>
                      <span>Story</span>
                      <span>Use</span>
                      <span>Choice</span>
                    </div>
                  </div>
                  <p className="summary-muted summary-muted--tight summary-muted--center">
                    {pathStrings.slide1Muted}
                  </p>
                </>
              )}
              {summarySlideIndex === 2 && (
                <>
                  <p className="summary-eyebrow">What you offered</p>
                  <ul className="summary-behavior">
                    <li>
                      <span className="summary-behavior-num">{likeCount}</span>
                      total likes
                    </li>
                    <li>
                      <span className="summary-behavior-num">{saveCount}</span>
                      total saves
                    </li>
                    <li>
                      <span className="summary-behavior-num">{purchaseCount}</span>
                      total buys
                    </li>
                  </ul>
                  <p className="summary-body summary-body--tight">
                    {pathStrings.slide2PathLine}
                  </p>
                  <p className="summary-muted summary-muted--tight">
                    {skipCount} skips · ${totalSpent} toward things you viewed
                  </p>
                </>
              )}
              {summarySlideIndex === 3 && (
                <>
                  <p className="summary-eyebrow">Movement</p>
                  <p className="summary-body summary-body--spaced">
                    {pathStrings.slide3LineA}
                  </p>
                  <p className="summary-body summary-body--spaced">
                    {pathStrings.slide3LineB}
                  </p>
                  <p className="summary-body summary-body--dim summary-body--spaced">
                    {pathStrings.slide3Amplify}
                  </p>
                </>
              )}
              {summarySlideIndex === 4 && (
                <>
                  <p className="summary-eyebrow">A question</p>
                  <p className="summary-prompt">{pathStrings.slide4Question}</p>
                  <label className="summary-input-label" htmlFor="reflection">
                    Only on this device — you don’t have to answer.
                  </label>
                  <textarea
                    id="reflection"
                    className="summary-textarea"
                    rows={4}
                    value={reflectionInput}
                    onChange={(e) => setReflectionInput(e.target.value)}
                    placeholder="A word, a line, or silence."
                    autoComplete="off"
                  />
                </>
              )}
              {summarySlideIndex === 5 && (
                <>
                  <p className="summary-eyebrow">Carry this</p>
                  <p className="summary-body summary-body--closing">
                    {pathStrings.slide5LineA}
                  </p>
                  <p className="summary-body summary-body--closing">
                    {pathStrings.slide5LineB}
                  </p>
                  <p className="summary-body summary-body--closing summary-body--dim">
                    {pathStrings.slide5LineC}
                  </p>
                </>
              )}
            </div>

            <div className="summary-dots" aria-hidden>
              {Array.from({ length: SUMMARY_SLIDE_COUNT }, (_, i) => (
                <span
                  key={i}
                  className={
                    i === summarySlideIndex
                      ? "summary-dot summary-dot--active"
                      : "summary-dot"
                  }
                />
              ))}
            </div>

            <div className="summary-nav">
              {summarySlideIndex > 0 ? (
                <button
                  type="button"
                  className="summary-nav-btn summary-nav-btn--ghost"
                  onClick={goPrevSummarySlide}
                >
                  Back
                </button>
              ) : (
                <span className="summary-nav-spacer" aria-hidden />
              )}
              {!isLastSummarySlide ? (
                <button
                  type="button"
                  className="summary-nav-btn summary-nav-btn--primary"
                  onClick={goNextSummarySlide}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  className="summary-nav-btn summary-nav-btn--primary"
                  onClick={handleRestart}
                >
                  Play again
                </button>
              )}
            </div>

            <details className="summary-details">
              <summary>Session detail</summary>
              <div className="summary-details-body">
                <p>{profileMessage}</p>
                <p className="summary-details-meta">
                  Interest · {interestLabel}
                  {firstProductInteractionIndex !== null &&
                    ` · first touch on product-adjacent post: ${
                      firstProductInteractionIndex + 1
                    } / ${INTERACTIONS_TO_END}`}
                  {firstBuySlotIndex !== null &&
                    ` · first choice: post ${firstBuySlotIndex + 1}`}
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return null;
  }

  const productMoment = productPageMoment(currentCard);
  const pricing = getProductPricing(currentCard);

  return (
    <div className="app-shell">
      <div className="phone">
        <header className="dash-minimal" aria-label="Session stats">
          <span className="dash-item">
            Wallet <strong>${wallet}</strong>
          </span>
          <span className="dash-dot" aria-hidden>
            ·
          </span>
          <span className="dash-item">
            Warmth <strong>{adIntensity}</strong>
          </span>
          <span className="dash-dot" aria-hidden>
            ·
          </span>
          <span className="dash-item">
            Chose <strong>{purchaseCount}</strong>
          </span>
          <span className="dash-session">
            {interactionCount}/{INTERACTIONS_TO_END}
          </span>
        </header>
        <p className="brand-tiny">
          For you · {interestLabel}
        </p>

        {productPageOpen && showCommerceChrome ? (
          <div
            className="product-page product-page--enter"
            role="dialog"
            aria-modal="true"
            aria-label="Product moment"
          >
            <div className="product-page__top">
              <button
                type="button"
                className="product-page__back"
                onClick={() => setProductPageOpen(false)}
                aria-label="Back to feed"
              >
                <span className="product-page__back-icon" aria-hidden>
                  ←
                </span>
                <span>Back to Feed</span>
              </button>
            </div>
            <div className="product-page__scroll">
              <div className="product-page__hero">
                {(pricing.promoTag || pricing.hasCompare) && (
                  <div className="product-page__hero-badges" aria-hidden>
                    {pricing.promoTag && (
                      <span className="product-page__badge product-page__badge--tag">
                        {pricing.promoTag}
                      </span>
                    )}
                    {pricing.hasCompare && (
                      <span className="product-page__badge product-page__badge--pct">
                        −{pricing.savePct}%
                      </span>
                    )}
                  </div>
                )}
                <img
                  className="product-page__img"
                  src={thumbnailUrlForCard(currentCard)}
                  alt=""
                  width={400}
                  height={420}
                />
              </div>
              <div className="product-page__body">
                <p className="product-page__eyebrow">
                  {INTEREST_META[selectedInterest]?.label ?? "For you"}
                </p>
                <h2 className="product-page__title">{productMoment.headline}</h2>
                <p className="product-page__feeling">{productMoment.feeling}</p>
                {currentCard.price > 0 && (
                  <div className="product-page__price-block">
                    <div className="product-page__price-row">
                      <span className="product-page__price-now">
                        ${currentCard.price}
                      </span>
                      {pricing.hasCompare && (
                        <span
                          className="product-page__price-was"
                          aria-label={`Reference price ${pricing.listPrice} dollars`}
                        >
                          ${pricing.listPrice}
                        </span>
                      )}
                    </div>
                    {pricing.hasCompare ? (
                      <p className="product-page__save-hint">
                        Save about ${pricing.saveAmount} vs. reference · about{" "}
                        {pricing.savePct}% off
                      </p>
                    ) : (
                      <p className="product-page__price-note">
                        Your routine price · ${currentCard.price}
                      </p>
                    )}
                  </div>
                )}
                <ul className="product-page__quotes" aria-label="What people said">
                  {(currentCard.comments ?? []).slice(0, 3).map((c, i) => (
                    <li key={i} className="product-page__quote">
                      <span className="product-page__quote-user">@{c.user}</span>
                      <span className="product-page__quote-text">{c.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="product-page__footer">
              <button
                type="button"
                className="product-page__cta"
                onClick={handleBuy}
                disabled={!canBuy}
                aria-label={
                  canBuy
                    ? "Add to routine and continue feed"
                    : "Not enough balance to add to routine"
                }
              >
                {canBuy
                  ? `Add to Routine · $${currentCard.price}`
                  : `Need $${currentCard.price} · you have $${wallet}`}
              </button>
            </div>
          </div>
        ) : (
          <div className="feed-area">
            <article
              key={currentCard.id}
              className="video-card card-enter"
              aria-label="Current video in feed"
            >
              <img
                className="video-thumb"
                src={thumbnailUrlForCard(currentCard)}
                alt=""
                width={400}
                height={700}
              />
              <div className="video-shade" aria-hidden />
              <div className="video-caption-block">
                <div className="video-caption">
                  <h2 className="video-title">{currentCard.title}</h2>
                  {showCommerceChrome && currentCard.price > 0 && (
                    <p className="video-price video-price--soft">${currentCard.price}</p>
                  )}
                </div>
                <div className="comment-snips" aria-label="Sample comments">
                  {(currentCard.comments ?? []).map((c, i) => (
                    <p key={i} className="comment-snip">
                      <span className="comment-user">@{c.user}</span> {c.text}
                    </p>
                  ))}
                </div>
              </div>
              <div className={railClass}>
                <button
                  type="button"
                  className="action-pill action-pill--like"
                  onClick={handleLike}
                  aria-label="Like"
                >
                  <span className="action-icon" aria-hidden>
                    ♥
                  </span>
                  <span className="action-label">Like</span>
                </button>
                <button
                  type="button"
                  className="action-pill action-pill--skip"
                  onClick={handleSkip}
                  aria-label="Skip"
                >
                  <span className="action-icon" aria-hidden>
                    ↓
                  </span>
                  <span className="action-label">Skip</span>
                </button>
                {showSave && (
                  <button
                    type="button"
                    className="action-pill action-pill--save"
                    onClick={handleSave}
                    aria-label="Save"
                  >
                    <span className="action-icon" aria-hidden>
                      ★
                    </span>
                    <span className="action-label">Save</span>
                  </button>
                )}
                {showCommerceChrome && (
                  <button
                    type="button"
                    className="action-pill action-pill--product"
                    onClick={() => setProductPageOpen(true)}
                    aria-label="View product page"
                    title="View product page"
                  >
                    <span className="action-icon" aria-hidden>
                      ↗
                    </span>
                    <span className="action-label">View product</span>
                  </button>
                )}
              </div>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
