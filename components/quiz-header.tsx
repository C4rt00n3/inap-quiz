import styles from "@/app/styles/quiz-header.module.css";

type QuizHeaderProps = {
  title: string;
  subject: string;
  lesson: string;
};

/**
 * Displays the test title and basic metadata.
 */
export function QuizHeader({ title, subject, lesson }: QuizHeaderProps) {
  return (
    <header className={styles.header}>
      <span className={styles.kicker}>Teste Educacional</span>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Materia</span>
          <strong>{subject}</strong>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Aula</span>
          <strong>{lesson}</strong>
        </div>
      </div>
    </header>
  );
}
