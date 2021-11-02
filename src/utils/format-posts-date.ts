import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Post } from '../pages';

export const formatPostsDate = (posts: Post[]): Post[] =>
  posts.map(post => ({
    ...post,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
  }));
