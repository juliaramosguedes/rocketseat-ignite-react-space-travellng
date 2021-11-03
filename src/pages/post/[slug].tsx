import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import Info from '../../components/Info';
import { formatDate } from "../../utils/format-posts-date";

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({
  post: {
    first_publication_date,
    data: {
      title,
      content,
      author,
      banner: { url },
    },
  },
}: PostProps) {
  const router = useRouter();

  const readTime = useMemo(() => {
    if (router.isFallback) {
      return 0;
    }

    let fullText = '';
    const readWordsPerMinute = 200;

    content.forEach(({ heading, body }) => {
      fullText += heading;
      fullText += RichText.asText(body);
    });

    return Math.ceil(fullText.split(/\s/g).length / readWordsPerMinute);
  }, [content, router.isFallback]);

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Head>
        <title>{title} | SpaceTraveling</title>
      </Head>
      <Header />
      <img src={url} alt={title} />
      <article className={commonStyles.wrap}>
        <h1 className={styles.title}>{title}</h1>
        <div className={commonStyles.infos}>
          <Info icon={FiCalendar} text={formatDate(first_publication_date)} />
          <Info icon={FiUser} text={author} />
          <Info icon={FiClock} text={`${readTime} min`} />
        </div>
        <div>
          {content.map(({ heading, body }) => {
            return (
              <div key={heading}>
                <h2 className={styles.heading}>{heading}</h2>
                <div
                  className={styles.body}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(body),
                  }}
                />
              </div>
            );
          })}
        </div>
      </article>
      <footer className={commonStyles.footer} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  return {
    props: {
      post: response,
    },
    revalidate: 60 * 5, // 5 minutes
  };
};
