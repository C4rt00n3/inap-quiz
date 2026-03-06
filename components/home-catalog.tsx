"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TestSummary } from "@/types/test";
import styles from "@/app/styles/home-page.module.css";

type HomeCatalogProps = {
  tests: TestSummary[];
};

const ALL_SUBJECTS = "Todas";

/**
 * Renders the home catalog with subject filters and grouped quiz cards.
 */
export function HomeCatalog({ tests }: HomeCatalogProps) {
  const [selectedSubject, setSelectedSubject] = useState(ALL_SUBJECTS);

  const subjects = useMemo(() => {
    const unique = Array.from(new Set(tests.map((test) => test.subject)));
    unique.sort((a, b) => a.localeCompare(b, "pt-BR"));

    return [ALL_SUBJECTS, ...unique];
  }, [tests]);

  const visibleTests = useMemo(() => {
    if (selectedSubject === ALL_SUBJECTS) {
      return tests;
    }

    return tests.filter((test) => test.subject === selectedSubject);
  }, [selectedSubject, tests]);

  const testsBySubject = useMemo(() => {
    return visibleTests.reduce<Record<string, TestSummary[]>>((acc, test) => {
      if (!acc[test.subject]) {
        acc[test.subject] = [];
      }

      acc[test.subject].push(test);
      return acc;
    }, {});
  }, [visibleTests]);

  const groupedSubjects = useMemo(() => {
    return Object.keys(testsBySubject).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [testsBySubject]);

  if (tests.length === 0) {
    return <p className={styles.empty}>Nenhum quiz disponivel no momento.</p>;
  }

  return (
    <>
      <section className={styles.filters}>
        <p className={styles.filterLabel}>Filtrar por materia</p>
        <div className={styles.filterChips}>
          {subjects.map((subject) => {
            const isActive = subject === selectedSubject;

            return (
              <button
                key={subject}
                type="button"
                className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ""}`}
                onClick={() => setSelectedSubject(subject)}
              >
                {subject}
              </button>
            );
          })}
        </div>
      </section>

      <div className={styles.subjectSections}>
        {groupedSubjects.map((subject) => (
          <section key={subject} className={styles.subjectBlock}>
            <div className={styles.subjectHeader}>
              <h2>{subject}</h2>
              <span>{testsBySubject[subject].length} quizzes</span>
            </div>

            <div className={styles.grid}>
              {testsBySubject[subject].map((test) => (
                <article key={test.slug} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.subjectTag}>{subject}</span>
                    <span className={styles.lesson}>{test.lesson}</span>
                  </div>

                  <h3>{test.title}</h3>
                  <p className={styles.cardText}>Teste com foco em pratica objetiva e rapida.</p>

                  <div className={styles.cardFooter}>
                    <span className={styles.badge}>{test.questionCount} questoes</span>
                    <Link href={`/teste/${test.slug}`} className={styles.button}>
                      Comecar
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
