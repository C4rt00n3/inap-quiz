"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/question-card";
import { QuizHeader } from "@/components/quiz-header";
import type { Question, TestData } from "@/types/test";
import styles from "@/app/styles/quiz-page.module.css";

type QuizClientProps = {
  test: TestData;
  slug: string;
};

type AnswerMap = Record<string, string>;

/**
 * Shuffles option order with Fisher-Yates using a deterministic seed.
 */
function shuffleOptions(options: Question["options"], seed: number) {
  const shuffled = [...options];
  let state = seed || 1;

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const randomIndex = Math.floor((state / 4294967296) * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[randomIndex];
    shuffled[randomIndex] = temp;
  }

  return shuffled;
}

/**
 * Creates a stable numeric seed from question id.
 */
function hashQuestionId(questionId: string) {
  let hash = 0;

  for (let i = 0; i < questionId.length; i += 1) {
    hash = (hash * 31 + questionId.charCodeAt(i)) >>> 0;
  }

  return hash;
}

/**
 * Renders the interactive quiz flow and redirects to the result screen on submit.
 */
export function QuizClient({ test, slug }: QuizClientProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [shuffleSeed] = useState(() => Math.floor(Math.random() * 1_000_000_000));

  const visibleQuestions = useMemo(() => {
    return test.questions.map((question) => ({
      ...question,
      options: shuffleOptions(question.options, shuffleSeed + hashQuestionId(question.id)),
    }));
  }, [shuffleSeed, test.questions]);

  const score = useMemo(() => {
    return visibleQuestions.reduce((total, question) => {
      if (answers[question.id] === question.correctOptionId) {
        return total + 1;
      }

      return total;
    }, 0);
  }, [answers, visibleQuestions]);

  /**
   * Updates a selected option for a given question.
   */
  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: optionId,
    }));
  };

  /**
   * Redirects to a dedicated result page after computing the final score.
   */
  const handleSubmit = () => {
    const query = new URLSearchParams({
      acertos: String(score),
      total: String(visibleQuestions.length),
    });

    router.push(`/teste/${slug}/resultado?${query.toString()}`);
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <QuizHeader title={test.title} subject={test.subject} lesson={test.lesson} level={test.level} />

        <section className={styles.questions}>
          {visibleQuestions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              questionNumber={index + 1}
              selectedOptionId={answers[question.id]}
              onSelectOption={handleSelectOption}
            />
          ))}
        </section>

        <div className={styles.actions}>
          <button type="button" className={styles.submitButton} onClick={handleSubmit}>
            Concluir Teste
          </button>
        </div>
      </div>
    </main>
  );
}
