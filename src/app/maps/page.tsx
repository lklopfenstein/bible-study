import styles from './page.module.css';

const maps = [
  { id: 1, title: 'Paul\'s Missionary Journeys', desc: 'Trace the routes of the Apostle Paul through Asia Minor and Europe.', image: '🗺️' },
  { id: 2, title: 'The Exodus Route', desc: 'The path of the Israelites from Egypt to the Promised Land.', image: '🏜️' },
  { id: 3, title: 'Jerusalem in the Time of Jesus', desc: 'A detailed layout of the holy city during the first century.', image: '🏛️' },
];

export default function MapsPage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Historical Maps</h1>
      <p className={styles.subtitle}>Explore the geography of the biblical world.</p>

      <div className={styles.grid}>
        {maps.map(map => (
          <div key={map.id} className={styles.card}>
            <div className={styles.imagePlaceholder}>{map.image}</div>
            <h2 className={styles.cardTitle}>{map.title}</h2>
            <p className={styles.cardDesc}>{map.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
