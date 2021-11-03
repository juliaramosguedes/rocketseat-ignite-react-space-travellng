import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';

import { Post } from '../../pages';
import styles from './post-card.module.scss';
import commonStyles from '../../styles/common.module.scss';
import Info from '../Info';

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
      <div className={commonStyles.infos}>
        <Info icon={FiCalendar} text={first_publication_date} />
        <Info icon={FiUser} text={author} />
      </div>
    </div>
  );
}
