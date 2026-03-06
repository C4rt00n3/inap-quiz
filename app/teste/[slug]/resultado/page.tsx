import Link from "next/link";
import { notFound } from "next/navigation";
import { ResultCard } from "@/components/result-card";
import { getAllTests } from "@/lib/tests";
import styles from "@/app/styles/result-page.module.css";

type ResultPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ acertos?: string; total?: string }>;
};

/**
 * Prebuilds static params for each test result route.
 */
export async function generateStaticParams() {
  const tests = await getAllTests();

  return tests.map((test) => ({
    slug: test.slug,
  }));
}

/**
 * Dedicated result page displayed only after the user submits the test.
 */
export default async function ResultPage({ params, searchParams }: ResultPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const score = Number.parseInt(query.acertos ?? "", 10);
  const total = Number.parseInt(query.total ?? "", 10);

  if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0 || score < 0 || score > total) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.kicker}>Teste finalizado</p>
        <ResultCard score={score} total={total} />

        <div className={styles.actions}>
          <Link href={`/teste/${slug}`} className={styles.secondaryButton}>
            Refazer teste
          </Link>
          <Link href="/" className={styles.primaryButton}>
            Ir para home
          </Link>
        </div>
      </section>
    </main>
  );
}