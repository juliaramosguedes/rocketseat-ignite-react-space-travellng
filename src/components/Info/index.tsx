import { IconType } from "react-icons";

import styles from './info.module.scss';

interface InfoProps {
  icon: IconType;
  text: string;
};

export default function Info({ icon: Icon, text }: InfoProps) {
  return (
    <div className={styles.info}>
      <Icon />
      {text}
    </div>
  );
}
