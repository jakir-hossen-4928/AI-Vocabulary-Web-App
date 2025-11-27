export interface VocabularyExample {
  bn: string;
  en: string;
}

export interface Vocabulary {
  id: string;
  bangla: string;
  english: string;
  partOfSpeech: string;
  pronunciation: string;
  examples: VocabularyExample[];
  synonyms: string[];
  antonyms: string[];
  explanation: string;
  createdAt: string | number;
  updatedAt: string | number;
  userId: string;
  // Optional fields for online dictionary results
  origin?: string;
  audioUrl?: string;
  isFromAPI?: boolean;
  isOnline?: boolean;
}

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "preposition"
  | "conjunction"
  | "interjection"
  | "phrase"
  | "idiom"
  | "phrasal verb"
  | "collocation"
  | "linking phrase";
