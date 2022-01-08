import { useMemo } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Comments from '../../components/Comments';
import Header from '../../components/Header';
import Info from '../../components/Info';
import { formatDate } from '../../utils/format-posts-date';

interface Post {
  first_publication_date: string | null;
  uid: string;
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

interface Navigation {
  prevPost: Post | null;
  nextPost: Post | null;
}

interface PostProps {
  post: Post;
  preview: boolean;
  navigation: Navigation;
}

export default function Post({ preview, post, navigation }: PostProps) {
  const router = useRouter();

  const readTime = useMemo(() => {
    if (router.isFallback) {
      return 0;
    }

    const readWordsPerMinute = 200;

    const fullText = post?.data?.content?.reduce((acc, { heading, body }) => {
      acc += heading;
      acc += RichText.asText(body);
      return acc;
    }, '');

    return Math.ceil(fullText.split(/\s/g).length / readWordsPerMinute);
  }, [post?.data?.content, router.isFallback]);

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | SpaceTraveling</title>
      </Head>
      <Header />
      <img src={post.data.banner.url} alt={post.data.title} />
      <article className={commonStyles.wrap}>
        <h1 className={styles.title}>{post.data.title}</h1>
        <div className={commonStyles.infos}>
          <Info icon={FiCalendar} text={formatDate(post.first_publication_date)} />
          <Info icon={FiUser} text={post.data.author} />
          <Info icon={FiClock} text={`${readTime} min`} />
        </div>
        <div>
          {post.data.content.map(({ heading, body }) => {
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
      <section className={`${styles.navigation} ${commonStyles.wrap}`}>
        {navigation.prevPost && (
          <div>
            <h3>{navigation.prevPost.data.title}</h3>
            <Link href={`/post/${navigation.prevPost.uid}`}>
              <a>Post anterior</a>
            </Link>
          </div>
        )}
        {navigation.nextPost && (
          <div>
            <h3>{navigation.nextPost.data.title}</h3>
            <Link href={`/post/${navigation.nextPost.uid}`}>
              <a>Próximo post</a>
            </Link>
          </div>
        )}
      </section>

      <Comments />
      {preview && (
        <aside className={commonStyles.preview}>
          <Link href="/api/exit-preview">
            <a>Sair do modo Preview</a>
          </Link>
        </aside>
      )}
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const prevPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const nextPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  return {
    props: {
      post: response,
      preview,
      navigation: {
        nextPost: nextPost.results[0] ?? null,
        prevPost: prevPost.results[0] ?? null,
      },
    },
    revalidate: 60 * 5, // 5 minutes
  };
};
