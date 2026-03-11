export interface User {
  id: string;
  username: string;
  avatar_skin: string;
  avatar_hair: string;
  avatar_outfit: string;
  avatar_accessory: string;
  avatar_mood: string;
  bio?: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  username: string;
  title: string;
  content: string;
  category: string;
  looking_for_advice: boolean;
  created_at: string;
  comment_count: number;
  reaction_count: number;
  reactions?: Record<string, number>;
  avatar_skin: string;
  avatar_hair: string;
  avatar_outfit: string;
  avatar_accessory: string;
  avatar_mood: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  username: string;
  content: string;
  parent_id?: string;
  created_at: string;
  avatar_skin: string;
  avatar_hair: string;
  avatar_outfit: string;
  avatar_accessory: string;
  avatar_mood: string;
}

export interface Reaction {
  type: string;
  count: number;
}

export interface Notification {
  id: number;
  user_id: number;
  actor_id: number;
  actor_username: string;
  post_id: number;
  post_title: string;
  type: 'comment' | 'reaction';
  message: string;
  created_at: string;
  is_read: boolean;
}

export type Category = 'stress' | 'anxiety' | 'burnout' | 'loneliness' | 'relationships' | 'family' | 'self-esteem' | 'school/work';
