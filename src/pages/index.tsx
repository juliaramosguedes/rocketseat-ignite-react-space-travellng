import { useState } from 'react';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import { formatPostsDate } from '../utils/format-posts-date';

export interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const [posts, setPosts] = useState<PostPagination>({
    ...postsPagination,
    results: formatPostsDate(postsPagination.results),
  });

  async function loadMorePosts(): Promise<void> {
    const response = await fetch(posts.next_page).then(data => data.json());

    const formattedPosts = formatPostsDate(response.results);

    const newPosts = {
      ...posts,
      next_page: response.next_page,
      results: [...posts.results, ...formattedPosts],
    };

    setPosts(newPosts);
  }

  return (
    <>
      <Head>
        <title>Home | SpaceTraveling</title>
      </Head>
      <Header />
      <main className={commonStyles.wrap}>
        <div className={styles.container}>
          {posts.results.map((post) => (
            <PostCard
              first_publication_date={post.first_publication_date}
              data={post.data}
              uid={post.uid}
              key={post.data.title}
            />
          ))}
        </div>
        {posts.next_page && (
          <button className={styles.button} onClick={loadMorePosts}>Carregar mais posts</button>
        )}
        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a className={commonStyles.preview}>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
      <footer className={commonStyles.footer} />
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 2,
      ref: previewData?.ref ?? null,
    }
  );

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  };

  return {
    props: {
      postsPagination,
      preview,
    },
    revalidate: 60 * 5, // 5 minutes
  };
};
