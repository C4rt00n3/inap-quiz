import styles from "@/app/styles/quiz-header.module.css";

type QuizHeaderProps = {
  title: string;
  subject: string;
  lesson: string;
  level: string;
};

/**
 * Displays the test title and basic metadata.
 */
export function QuizHeader({ title, subject, lesson, level }: QuizHeaderProps) {
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
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Nivel</span>
          <strong>{level}</strong>
        </div>
      </div>
    </header>
  );
}
