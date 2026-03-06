"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/question-card";
import { QuizHeader } from "@/components/quiz-header";
import type { TestData } from "@/types/test";
import styles from "@/app/styles/quiz-page.module.css";

type QuizClientProps = {
  test: TestData;
  slug: string;
};

type AnswerMap = Record<string, string>;

/**
 * Renders the interactive quiz flow and redirects to the result screen on submit.
 */
export function QuizClient({ test, slug }: QuizClientProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});

  const score = useMemo(() => {
    return test.questions.reduce((total, question) => {
      if (answers[question.id] === question.correctOptionId) {
        return total + 1;
      }

      return total;
    }, 0);
  }, [answers, test.questions]);

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
      total: String(test.questions.length),
    });

    router.push(`/teste/${slug}/resultado?${query.toString()}`);
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <QuizHeader title={test.title} subject={test.subject} lesson={test.lesson} />

        <section className={styles.questions}>
          {test.questions.map((question, index) => (
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
