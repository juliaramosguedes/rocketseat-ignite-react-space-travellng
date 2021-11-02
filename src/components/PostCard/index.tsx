import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';

import { Post } from '../../pages';
import styles from './post-card.module.scss';

export default function PostCard({
  uid,
  first_publication_date,
  data: { title, subtitle, author },
}: Post) {
  return (
    <div>
      <Link href={`/post/${uid}`} passHref>
        <a>
          <h2 className={styles.title}>{title}</h2>
        </a>
      </Link>
      <p className={styles.subtitle}>{subtitle}</p>
      <div className={styles.info}>
        <div>
          <FiCalendar />
          <time>{first_publication_date}</time>
        </div>
        <div>
          <FiUser />
          {author}
        </div>
      </div>
    </div>
  );
}
