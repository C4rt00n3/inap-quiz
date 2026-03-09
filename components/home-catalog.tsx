"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TestSummary } from "@/types/test";
import styles from "@/app/styles/home-page.module.css";

type HomeCatalogProps = {
  tests: TestSummary[];
};

const ALL_SUBJECTS = "Todas";
const EMPTY_LEVEL = "";

/**
 * Renders the home catalog with subject filters and grouped quiz cards.
 */
export function HomeCatalog({ tests }: HomeCatalogProps) {
  const [selectedSubject, setSelectedSubject] = useState(ALL_SUBJECTS);
  const [selectedLevel, setSelectedLevel] = useState(EMPTY_LEVEL);

  const subjects = useMemo(() => {
    const unique = Array.from(new Set(tests.map((test) => test.subject)));
    unique.sort((a, b) => a.localeCompare(b, "pt-BR"));

    return [ALL_SUBJECTS, ...unique];
  }, [tests]);

  const levelOptions = useMemo(() => {
    if (selectedSubject === ALL_SUBJECTS) {
      return [];
    }

    const unique = Array.from(
      new Set(
        tests
          .filter((test) => test.subject === selectedSubject)
          .map((test) => test.level),
      ),
    );

    const order: TestSummary["level"][] = ["Basico", "Intermediario", "Avancado"];
    return unique.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [selectedSubject, tests]);

  const visibleTests = useMemo(() => {
    if (selectedSubject === ALL_SUBJECTS || !selectedLevel) {
      return [];
    }

    return tests.filter((test) => test.subject === selectedSubject && test.level === selectedLevel);
  }, [selectedLevel, selectedSubject, tests]);

  if (tests.length === 0) {
    return <p className={styles.empty}>Nenhum quiz disponivel no momento.</p>;
  }

  return (
    <>
      <section className={styles.filters}>
        <p className={styles.filterLabel}>1. Escolha a materia</p>
        <div className={styles.filterChips}>
          {subjects.map((subject) => {
            const isActive = subject === selectedSubject;

            return (
              <button
                key={subject}
                type="button"
                className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ""}`}
                onClick={() => {
                  setSelectedSubject(subject);
                  setSelectedLevel(EMPTY_LEVEL);
                }}
              >
                {subject}
              </button>
            );
          })}
        </div>
      </section>

      {selectedSubject !== ALL_SUBJECTS && (
        <section className={styles.filters}>
          <p className={styles.filterLabel}>2. Escolha o nivel</p>
          <div className={styles.filterChips}>
            {levelOptions.map((level) => {
              const isActive = level === selectedLevel;

              return (
                <button
                  key={level}
                  type="button"
                  className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ""}`}
                  onClick={() => setSelectedLevel(level)}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {selectedSubject === ALL_SUBJECTS && (
        <p className={styles.empty}>Selecione uma materia para ver os niveis e os testes.</p>
      )}

      {selectedSubject !== ALL_SUBJECTS && !selectedLevel && (
        <p className={styles.empty}>Agora selecione um nivel para listar os testes.</p>
      )}

      {selectedSubject !== ALL_SUBJECTS && selectedLevel && (
        <section className={styles.subjectBlock}>
          <div className={styles.subjectHeader}>
            <h2>
              3. Testes disponiveis - {selectedSubject} ({selectedLevel})
            </h2>
            <span>{visibleTests.length} quizzes</span>
          </div>

          <div className={styles.grid}>
            {visibleTests.map((test) => (
              <article key={test.slug} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.subjectTag}>{selectedSubject}</span>
                  <span className={styles.lesson}>{test.lesson}</span>
                </div>

                <h3>{test.title}</h3>
                <p className={styles.cardText}>Teste com foco em pratica objetiva e rapida.</p>

                <div className={styles.cardFooter}>
                  <div className={styles.badgeRow}>
                    <span className={styles.badge}>{test.level}</span>
                    <span className={styles.badge}>{test.questionCount} questoes</span>
                  </div>
                  <Link href={`/teste/${test.slug}`} className={styles.button}>
                    Comecar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
