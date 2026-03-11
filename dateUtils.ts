import { formatDistanceToNow } from 'date-fns';

export const formatShortDate = (date: Date | string | number): string => {
  const distance = formatDistanceToNow(new Date(date));
  
  return distance
    .replace('about ', '')
    .replace('less than a minute', 'now')
    .replace(' minute ago', 'm ago')
    .replace(' minutes ago', 'm ago')
    .replace(' hour ago', 'h ago')
    .replace(' hours ago', 'h ago')
    .replace(' day ago', 'd ago')
    .replace(' days ago', 'd ago')
    .replace(' month ago', 'mo ago')
    .replace(' months ago', 'mo ago')
    .replace(' year ago', 'y ago')
    .replace(' years ago', 'y ago')
    .replace(' ago', '');
};
