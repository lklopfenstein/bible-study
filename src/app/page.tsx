import styles from './page.module.css';
import Link from 'next/link';
import StartReadingButton from '@/components/ui/StartReadingButton';
import DailyVerse from '@/components/ui/DailyVerse';

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Study Bible</h1>
        <p className={styles.subtitle}>A beautiful, distraction-free reading experience.</p>
      </header>

      <section className={styles.hero}>
        <DailyVerse />
        <StartReadingButton />
      </section>
    </main>
  );
}
