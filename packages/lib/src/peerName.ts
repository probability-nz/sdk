import { adjectives, animals, uniqueNamesGenerator } from "@joaomoreno/unique-names-generator";
import { fnv1a } from "./fnv1a";

const excludeAdjectives = [
  "angry", "annoyed", "anxious", "arrogant", "ashamed", "awkward", "awful",
  "bad", "bitter", "chubby", "clumsy", "condemned", "creepy", "criminal",
  "dead", "depressed", "desperate", "dirty", "disturbed", "dreadful", "dusty",
  "dying", "elderly", "evil", "foolish", "frail", "furious", "greasy",
  "grieving", "gross", "grotesque", "grubby", "grumpy", "guilty", "horrible",
  "hostile", "hurt", "ill", "injured", "jealous", "lazy", "lonely", "mad",
  "mean", "mental", "miserable", "misleading", "muddy", "naked", "nasty",
  "nutty", "obnoxious", "odd", "painful", "panicky", "peculiar", "poor",
  "pregnant", "psychiatric", "puny", "quarrelsome", "ratty", "repulsive",
  "rude", "sad", "scared", "scary", "scrawny", "selfish", "sick", "skinny",
  "slimy", "smoggy", "stingy", "strange", "testy", "toxic", "troubled",
  "ugly", "ugliest", "unhappy", "upset", "useless", "vicious", "violent",
  "weak", "wicked",
];

const excludeAnimals = [
  "bedbug", "centipede", "cockroach", "earwig", "flea", "hookworm", "leech",
  "louse", "mite", "roundworm", "silverfish", "tick",
];

const extraAnimals = [
  // NZ birds
  "tūī", "pūkeko", "hoiho", "kākā", "moa", "huia", "whio", "kōkako", "kererū",
  "kakapo", "ruru", "takahē", "weka", "kea", "matuku", "kōtare", "kāhu", "toroa",
  // NZ other
  "tuatara", "taniwha", "pekapeka", "mokomoko", "kōura", "pāua", "kina",
  // Cryptids/myth
  "mothman", "chupacabra", "jackalope", "yowie", "mokele", "griffin", "chimera",
];

const safeAdjectives = adjectives.filter((a) => !excludeAdjectives.includes(a));
const safeAnimals = [...animals.filter((a) => !excludeAnimals.includes(a)), ...extraAnimals];

/**
 * Deterministic, friendly peer name from a peer id (e.g. "Brave Penguin").
 * Seeded with FNV-1a to compensate for the upstream generator's weak string seeding.
 * @group Presence
 */
export const getPeerName = (peerId: string): string =>
  uniqueNamesGenerator({
    dictionaries: [safeAdjectives, safeAnimals],
    separator: " ",
    seed: fnv1a(peerId),
    style: "capital",
  });
