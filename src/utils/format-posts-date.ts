import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Post } from '../pages';

export const formatDate = (date: string): string =>
  format(new Date(date), 'dd MMM yyyy', {
    locale: ptBR,
  });

export const formatPostsDate = (posts: Post[]): Post[] =>
  posts.map(post => ({
    ...post,
    first_publication_date: formatDate(post.first_publication_date),
  }));
