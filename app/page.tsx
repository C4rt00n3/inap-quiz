import { HomeCatalog } from "@/components/home-catalog";
import { getAllTests } from "@/lib/tests";
import styles from "@/app/styles/home-page.module.css";

/**
 * Home page that lists all tests discovered inside data/*.json.
 */
export default async function HomePage() {
  const tests = await getAllTests();

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.kicker}>Area de Estudos</p>
          <h1 className={styles.title}>Escolha um quiz e comece agora</h1>
          <p className={styles.subtitle}>
            Selecione um card abaixo para iniciar. No final, voce vera seu desempenho em uma tela dedicada.
          </p>
        </section>

        <HomeCatalog tests={tests} />
      </div>
    </main>
  );
}
