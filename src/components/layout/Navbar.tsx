import Link from 'next/link';
import { BookOpen, Map, BookMarked, User } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">
          <span className={styles.logoText}>Study Bible</span>
        </Link>
      </div>
      <div className={styles.links}>
        <Link href="/read/genesis/1" className={styles.link}>
          <BookOpen size={20} />
          <span>Read</span>
        </Link>
        <Link href="/maps" className={styles.link}>
          <Map size={20} />
          <span>Maps</span>
        </Link>
        <Link href="/notes" className={styles.link}>
          <BookMarked size={20} />
          <span>Notes</span>
        </Link>
        <Link href="/profile" className={styles.link}>
          <User size={20} />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
