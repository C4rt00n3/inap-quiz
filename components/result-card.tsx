import styles from "@/app/styles/result-card.module.css";

type ResultCardProps = {
  score: number;
  total: number;
};

/**
 * Returns a performance label by score percentage.
 */
function getPerformanceMessage(percentage: number) {
  if (percentage >= 85) {
    return "Excelente desempenho";
  }

  if (percentage >= 60) {
    return "Bom desempenho";
  }

  return "Precisa melhorar";
}

/**
 * Displays score, percentage and visual progress indicator.
 */
export function ResultCard({ score, total }: ResultCardProps) {
  const percentage = Math.round((score / total) * 100);
  const performanceMessage = getPerformanceMessage(percentage);

  return (
    <section className={styles.card} aria-live="polite">
      <h3 className={styles.title}>Resultado do Teste</h3>

      <div className={styles.metrics}>
        <p>
          <strong>{score}</strong> acertos de <strong>{total}</strong> questoes
        </p>
        <p>
          Aproveitamento: <strong>{percentage}%</strong>
        </p>
      </div>

      <div className={styles.progressTrack} role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
        <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
      </div>

      <p className={styles.performance}>{performanceMessage}</p>
    </section>
  );
}
