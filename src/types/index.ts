export interface User {
  id: string;
  name: string;
  email: string;
  selected_class: number;
  avatar_color: string;
}

export interface QuestionRecord {
  id: string;
  user_id: string;
  class_level: number;
  question: string;
  subject: string;
  simple_answer: string;
  explanation: string;
  example?: string;
  key_point: string;
  is_unclear: boolean | number;
  clarification_prompt?: string;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  hint?: string;
}

export interface TopicItem {
  title: string;
  subtopics: string[];
  notes: string;
}

export interface StudyPack {
  id: string;
  user_id: string;
  title: string;
  class_level: number;
  subject: string;
  file_name: string;
  file_type: string;
  summary: string;
  topics: TopicItem[];
  important_points: string[];
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
  created_at: string;
}

export interface StudyPackSummaryItem {
  id: string;
  user_id: string;
  title: string;
  class_level: number;
  subject: string;
  file_name: string;
  file_type: string;
  summary: string;
  created_at: string;
}

export interface DemoAccount {
  name: string;
  email: string;
  password: string;
  class: number;
  description: string;
}
