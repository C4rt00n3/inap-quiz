export type Option = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  statement: string;
  difficulty: "Facil" | "Medio" | "Dificil";
  options: Option[];
  correctOptionId: string;
};

export type TestData = {
  title: string;
  subject: string;
  lesson: string;
  level: "Basico" | "Intermediario" | "Avancado";
  questions: Question[];
};

export type TestSummary = {
  slug: string;
  title: string;
  subject: string;
  lesson: string;
  level: "Basico" | "Intermediario" | "Avancado";
  questionCount: number;
};
