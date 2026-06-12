import styles from './DailyVerse.module.css';
import Link from 'next/link';

const verses = [
  { text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", reference: "John 3:16", book: "john", chapter: 3 },
  { text: "Trust in the LORD with all your heart and lean not on your own understanding;", reference: "Proverbs 3:5", book: "proverbs", chapter: 3 },
  { text: "I can do all this through him who gives me strength.", reference: "Philippians 4:13", book: "philippians", chapter: 4 },
  { text: "In the beginning God created the heavens and the earth.", reference: "Genesis 1:1", book: "genesis", chapter: 1 },
  { text: "The LORD is my shepherd, I lack nothing.", reference: "Psalm 23:1", book: "psalms", chapter: 23 },
  { text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", reference: "Romans 8:28", book: "romans", chapter: 8 },
  { text: "Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.", reference: "Matthew 6:34", book: "matthew", chapter: 6 },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.", reference: "Joshua 1:9", book: "joshua", chapter: 1 },
  { text: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control. Against such things there is no law.", reference: "Galatians 5:22-23", book: "galatians", chapter: 5 },
  { text: "For I know the plans I have for you,” declares the LORD, “plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11", book: "jeremiah", chapter: 29 },
  { text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God’s will is—his good, pleasing and perfect will.", reference: "Romans 12:2", book: "romans", chapter: 12 },
  { text: "Come to me, all you who are weary and burdened, and I will give you rest.", reference: "Matthew 11:28", book: "matthew", chapter: 11 },
  { text: "Cast all your anxiety on him because he cares for you.", reference: "1 Peter 5:7", book: "1-peter", chapter: 5 },
  { text: "Rejoice always, pray continually, give thanks in all circumstances; for this is God’s will for you in Christ Jesus.", reference: "1 Thessalonians 5:16-18", book: "1-thessalonians", chapter: 5 },
  { text: "Jesus answered, “I am the way and the truth and the life. No one comes to the Father except through me.”", reference: "John 14:6", book: "john", chapter: 14 }
];

export default function DailyVerse() {
  // Use the day of the year to pick a verse, so it changes every day
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const verseIndex = dayOfYear % verses.length;
  const dailyVerse = verses[verseIndex];

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Verse of the Day</h2>
      <div className={styles.scriptureContainer}>
        <span className={styles.quoteMark}>“</span>
        <p className={styles.scripture}>
          {dailyVerse.text}
        </p>
        <span className={styles.quoteMark}>”</span>
      </div>
      <Link href={`/read/${dailyVerse.book}/${dailyVerse.chapter}`} className={styles.referenceLink}>
        <span className={styles.reference}>{dailyVerse.reference}</span>
      </Link>
    </div>
  );
}
