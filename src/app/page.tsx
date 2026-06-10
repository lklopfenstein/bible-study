import styles from './page.module.css';
import Link from 'next/link';

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Study Bible</h1>
        <p className={styles.subtitle}>A beautiful, distraction-free reading experience.</p>
      </header>

      <section className={styles.hero}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Verse of the Day</h2>
          <p className={styles.scripture}>
            "For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."
          </p>
          <span className={styles.reference}>Jeremiah 29:11</span>
        </div>

        <Link href="/read" className={styles.button}>
          Begin Reading
        </Link>
      </section>
    </main>
  );
}
