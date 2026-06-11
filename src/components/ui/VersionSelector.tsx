'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import styles from './VersionSelector.module.css';

const VERSIONS = [
  { id: 'web', name: 'WEB - World English Bible' },
  { id: 'kjv', name: 'KJV - King James Version' },
  { id: 'bbe', name: 'BBE - Bible in Basic English' },
  { id: 'asv', name: 'ASV - American Standard Version' },
  { id: 'ylt', name: 'YLT - Young\'s Literal Translation' }
];

export default function VersionSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentVersion = searchParams.get('v') || 'web';

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVersion = e.target.value;
    router.push(pathname + '?' + createQueryString('v', newVersion));
  };

  return (
    <div className={styles.selectorWrapper}>
      <select 
        value={currentVersion} 
        onChange={handleVersionChange}
        className={styles.select}
        aria-label="Select Bible Version"
      >
        {VERSIONS.map(v => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>
    </div>
  );
}
