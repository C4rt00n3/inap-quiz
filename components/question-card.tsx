import type { Question } from "@/types/test";
import styles from "@/app/styles/question-card.module.css";

type QuestionCardProps = {
  question: Question;
  questionNumber: number;
  selectedOptionId?: string;
  onSelectOption: (questionId: string, optionId: string) => void;
};

/**
 * Renders one question with radio options.
 */
export function QuestionCard({
  question,
  questionNumber,
  selectedOptionId,
  onSelectOption,
}: QuestionCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {questionNumber}. {question.statement}
        </h2>
        <span className={styles.difficulty}>{question.difficulty}</span>
      </div>

      <fieldset className={styles.options}>
        <legend className={styles.legend}>Selecione uma alternativa</legend>
        {question.options.map((option) => {
          const inputId = `${question.id}-${option.id}`;

          return (
            <label key={option.id} htmlFor={inputId} className={styles.optionLabel}>
              <input
                id={inputId}
                type="radio"
                name={question.id}
                value={option.id}
                checked={selectedOptionId === option.id}
                onChange={() => onSelectOption(question.id, option.id)}
              />
              <span>{option.text}</span>
            </label>
          );
        })}
      </fieldset>
    </article>
  );
}
