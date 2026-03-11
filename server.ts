import express from 'express';
import { createServer as createViteServer } from 'vite';
import { neon } from '@neondatabase/serverless';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const sql = neon(process.env.DATABASE_URL);
const app = express();
app.use(express.json());

// Initialize Database
async function initDb() {
  
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      display_name VARCHAR(255) UNIQUE NOT NULL,
      avatar_style VARCHAR(50),
      hair_style VARCHAR(50),
      skin_tone VARCHAR(50),
      outfit_color VARCHAR(50),
      bio TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL
    );
  `;

  await sql`
    CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE comments (
      id SERIAL PRIMARY KEY,
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE reactions (
      id SERIAL PRIMARY KEY,
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      reaction_type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      actor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_read BOOLEAN DEFAULT FALSE
    );
  `;
}

// Seed Data Helper
const seedData = async () => {
  console.log('Seeding database with realistic data...');

  // 1. Categories
  const categoryNames = ['stress', 'anxiety', 'burnout', 'loneliness', 'relationships', 'family', 'self-esteem', 'school/work'];
  for (const name of categoryNames) {
    await sql`INSERT INTO categories (name) VALUES (${name}) ON CONFLICT DO NOTHING`;
  }
  const categories = await sql`SELECT * FROM categories`;

  // 2. Users (15-20)
  const existingUsers = await sql`SELECT COUNT(*) FROM users`;
  if (parseInt(existingUsers[0].count) > 0) {
    console.log('Database already seeded with users. Skipping rest of seeding.');
    return;
  }

  const usernames = [
    'MidnightMango', 'SoftThunder', 'quietcomet', 'tiredpixel', 'sleepylilac',
    'BlueLantern', 'TinyOrbit', 'matchamilk', 'staticheart', 'rainafter4',
    'starglass', 'papercloud', 'velvetnoise', 'slowember', 'gentlevoid'
  ];
  const skins = ['#FFDBAC', '#F1C27D', '#E0AC69', '#8D5524', '#C68642'];
  const hairs = ['short', 'long', 'curly', 'bald', 'spiky', 'braids', 'wavy', 'ponytail'];
  const outfits = ['#4B0082', '#FF69B4', '#87CEEB', '#2E8B57', '#708090'];
  const moods = ['peaceful', 'thoughtful', 'dreamy', 'optimistic', 'melancholy', 'determined', 'warm', 'confused', 'courageous', 'zen', 'lonely', 'creative', 'relaxed', 'pensive', 'kind'];

  for (const name of usernames) {
    await sql`
      INSERT INTO users (display_name, avatar_style, hair_style, skin_tone, outfit_color, bio, created_at)
      VALUES (
        ${name}, 
        ${moods[Math.floor(Math.random() * moods.length)]}, 
        ${hairs[Math.floor(Math.random() * hairs.length)]}, 
        ${skins[Math.floor(Math.random() * skins.length)]}, 
        ${outfits[Math.floor(Math.random() * outfits.length)]}, 
        ${'Anonymously sharing my journey.'},
        NOW() - (random() * interval '30 days')
      )
      ON CONFLICT (display_name) DO NOTHING
    `;
  }
  const users = await sql`SELECT * FROM users`;

  // 3. Posts (25)
  const postTemplates = [
    { title: "Does anyone else feel guilty when resting?", content: "I feel like I should always be productive. When I sit down to watch a movie or read, I just think about all the things I could be doing. It is exhausting.", cat: 'burnout' },
    { title: "I feel like everyone around me is moving forward except me", content: "Friends are getting married, buying houses, getting promotions. I am just... here. Does it ever get better?", cat: 'self-esteem' },
    { title: "Being around people doesn’t stop loneliness", content: "I can be in a room full of people laughing and still feel completely isolated. It is a strange kind of pain.", cat: 'loneliness' },
    { title: "I overthink every conversation I have", content: "Did I say something weird? Did they take that joke the wrong way? I replay moments for hours afterwards.", cat: 'anxiety' },
    { title: "I feel like I'm disappointing my family", content: "They have such high expectations for me. I am trying my best but I feel like it is never enough for them.", cat: 'family' },
    { title: "Work is consuming my entire life", content: "I wake up thinking about emails and go to sleep thinking about deadlines. I do not know who I am outside of my job anymore.", cat: 'burnout' },
    { title: "Struggling to find motivation for school", content: "Everything feels pointless lately. I just want to stay in bed and hide from the world.", cat: 'school/work' },
    { title: "How do you deal with friendship breakups?", content: "Losing a best friend feels harder than a romantic breakup. The silence is so loud.", cat: 'relationships' },
    { title: "Constant state of high alert", content: "My heart is always racing for no reason. I am just waiting for something bad to happen.", cat: 'anxiety' },
    { title: "The pressure of being the 'strong one'", content: "Everyone comes to me with their problems, but I have no one to go to with mine. I am tired of being strong.", cat: 'stress' }
  ];

  for (let i = 0; i < 25; i++) {
    const template = postTemplates[i % postTemplates.length];
    const user = users[Math.floor(Math.random() * users.length)];
    const category = categories.find(c => c.name === template.cat) || categories[Math.floor(Math.random() * categories.length)];
    
    await sql`
      INSERT INTO posts (user_id, category_id, title, content, created_at)
      VALUES (${user.id}, ${category.id}, ${template.title + (i > 9 ? ' #' + i : '')}, ${template.content}, NOW() - (random() * interval '30 days'))
    `;
  }
  const posts = await sql`SELECT * FROM posts`;

  // 4. Comments (80-100)
  const commentTexts = [
    "You’re definitely not alone in feeling this.",
    "I relate to this so much. It is like you took the words right out of my head.",
    "I went through something similar last year. It takes time, but it does get easier.",
    "Things may feel overwhelming now but they can change. Sending you strength.",
    "Thank you for sharing this. I felt so isolated until I read your post.",
    "I hear you. Your feelings are completely valid.",
    "Sending you a big virtual hug. You are doing better than you think.",
    "This is exactly how I have been feeling lately. We can get through this.",
    "Please be kind to yourself. You deserve rest and peace.",
    "I am here if you ever need someone to just listen."
  ];

  for (let i = 0; i < 90; i++) {
    const post = posts[Math.floor(Math.random() * posts.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const text = commentTexts[Math.floor(Math.random() * commentTexts.length)];
    
    await sql`
      INSERT INTO comments (post_id, user_id, content, created_at)
      VALUES (${post.id}, ${user.id}, ${text}, NOW() - (random() * interval '20 days'))
    `;
  }

  // 5. Reactions
  const reactionTypes = ['Support', 'I relate', 'Stay strong'];
  for (const post of posts) {
    const numReactions = Math.floor(Math.random() * 10) + 2;
    for (let i = 0; i < numReactions; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const type = reactionTypes[Math.floor(Math.random() * reactionTypes.length)];
      try {
        await sql`
          INSERT INTO reactions (post_id, user_id, reaction_type, created_at)
          VALUES (${post.id}, ${user.id}, ${type}, NOW() - (random() * interval '15 days'))
        `;
      } catch (e) {
        // Ignore duplicates if we were to add a unique constraint
      }
    }
  }

  console.log('Seeding complete.');
};

async function startServer() {
  // Force database reset to ensure schema is correct for Neon migration
  try {
    console.log('Checking database schema...');
    // Check if the new column exists. If not, we need to reset.
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'display_name'
    `;

    const tableCheck = await sql`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public' AND tablename = 'notifications'
    `;
    
    if (columnCheck.length === 0 || tableCheck.length === 0) {
      console.log('Schema mismatch or missing tables detected. Resetting database...');
      await initDb();
      await seedData();
    } else {
      console.log('Schema is up to date. Ensuring avatar variety...');
      // One-time fix to randomize avatars if they are all sheep
      const moods = ['peaceful', 'thoughtful', 'dreamy', 'optimistic', 'melancholy', 'determined', 'warm', 'confused', 'courageous', 'zen', 'lonely', 'creative', 'relaxed', 'pensive', 'kind'];
      const users = await sql`SELECT id FROM users`;
      for (const user of users) {
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        await sql`UPDATE users SET avatar_style = ${randomMood} WHERE id = ${user.id}`;
      }
    }
  } catch (err) {
    console.log('Database check failed or tables do not exist. Initializing...');
    await initDb();
    await seedData();
  }

  // API Routes
  app.get('/api/stats', async (req, res) => {
    try {
      const userCount = await sql`SELECT COUNT(*) FROM users`;
      const postCount = await sql`SELECT COUNT(*) FROM posts`;
      const reactionCount = await sql`SELECT COUNT(*) FROM reactions`;
      
      res.json({
        members: parseInt(userCount[0].count),
        discussions: parseInt(postCount[0].count),
        reactions: parseInt(reactionCount[0].count)
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/posts', async (req, res) => {
    const { filter, category } = req.query;
    
    try {
      let query = sql`
        SELECT 
          p.id, p.title, p.content, p.created_at,
          u.display_name as username, 
          u.avatar_style as avatar_mood, 
          u.hair_style as avatar_hair, 
          u.skin_tone as avatar_skin, 
          u.outfit_color as avatar_outfit,
          c.name as category,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
          (SELECT COUNT(*) FROM reactions WHERE post_id = p.id) as reaction_count,
          (SELECT json_object_agg(reaction_type, count) FROM (
            SELECT reaction_type, COUNT(*) as count 
            FROM reactions 
            WHERE post_id = p.id 
            GROUP BY reaction_type
          ) s) as reactions
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
      `;

      if (category && category !== 'All') {
        query = sql`${query} WHERE c.name = ${category as string}`;
      }

      if (filter === 'Trending') {
        query = sql`${query} ORDER BY reaction_count DESC`;
      } else if (filter === 'Most Supportive') {
        query = sql`${query} ORDER BY comment_count DESC`;
      } else {
        query = sql`${query} ORDER BY p.created_at DESC`;
      }

      const posts = await query;
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/posts/:id', async (req, res) => {
    try {
      const postResult = await sql`
        SELECT 
          p.id, p.title, p.content, p.created_at,
          u.display_name as username, 
          u.avatar_style as avatar_mood, 
          u.hair_style as avatar_hair, 
          u.skin_tone as avatar_skin, 
          u.outfit_color as avatar_outfit,
          c.name as category
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = ${parseInt(req.params.id)}
      `;

      if (postResult.length === 0) return res.status(404).json({ error: 'Post not found' });
      const post = postResult[0];

      const comments = await sql`
        SELECT 
          c.id, c.content, c.created_at,
          u.display_name as username, 
          u.avatar_style as avatar_mood, 
          u.hair_style as avatar_hair, 
          u.skin_tone as avatar_skin, 
          u.outfit_color as avatar_outfit
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ${parseInt(req.params.id)}
        ORDER BY c.created_at ASC
      `;

      const reactions = await sql`
        SELECT reaction_type as type, COUNT(*) as count
        FROM reactions
        WHERE post_id = ${parseInt(req.params.id)}
        GROUP BY reaction_type
      `;

      res.json({ ...post, comments, reactions });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/posts', async (req, res) => {
    const { user_id, title, content, category } = req.body;
    try {
      const catResult = await sql`SELECT id FROM categories WHERE name = ${category}`;
      const category_id = catResult[0]?.id;
      
      const result = await sql`
        INSERT INTO posts (user_id, category_id, title, content) 
        VALUES (${user_id}, ${category_id}, ${title}, ${content})
        RETURNING id
      `;
      res.json({ id: result[0].id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/comments', async (req, res) => {
    const { post_id, user_id, content } = req.body;
    try {
      const result = await sql`
        INSERT INTO comments (post_id, user_id, content) 
        VALUES (${post_id}, ${user_id}, ${content})
        RETURNING id
      `;

      // Trigger notification
      const postOwner = await sql`SELECT user_id FROM posts WHERE id = ${post_id}`;
      if (postOwner.length > 0 && postOwner[0].user_id !== user_id) {
        await sql`
          INSERT INTO notifications (user_id, actor_id, post_id, type, message)
          VALUES (${postOwner[0].user_id}, ${user_id}, ${post_id}, 'comment', 'commented on your post')
        `;
      }

      res.json({ id: result[0].id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/reactions', async (req, res) => {
    const { post_id, user_id, type } = req.body;
    try {
      await sql`
        INSERT INTO reactions (post_id, user_id, reaction_type) 
        VALUES (${post_id}, ${user_id}, ${type})
      `;

      // Trigger notification
      const postOwner = await sql`SELECT user_id FROM posts WHERE id = ${post_id}`;
      if (postOwner.length > 0 && postOwner[0].user_id !== user_id) {
        await sql`
          INSERT INTO notifications (user_id, actor_id, post_id, type, message)
          VALUES (${postOwner[0].user_id}, ${user_id}, ${post_id}, 'reaction', ${`reacted to your post with ${type}`})
        `;
      }

      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: 'Reaction failed' });
    }
  });

  app.post('/api/users', async (req, res) => {
    const { username, avatar_skin, avatar_hair, avatar_outfit, avatar_accessory, avatar_mood, bio } = req.body;
    try {
      const result = await sql`
        INSERT INTO users (display_name, avatar_style, hair_style, skin_tone, outfit_color, bio) 
        VALUES (${username}, ${avatar_mood}, ${avatar_hair}, ${avatar_skin}, ${avatar_outfit}, ${bio})
        RETURNING *
      `;
      const user = result[0];
      res.json({ 
        id: user.id, 
        username: user.display_name, 
        avatar_skin: user.skin_tone, 
        avatar_hair: user.hair_style, 
        avatar_outfit: user.outfit_color, 
        avatar_accessory: 'none', 
        avatar_mood: user.avatar_style, 
        bio: user.bio 
      });
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: 'Username already taken' });
    }
  });

  app.delete('/api/posts/:id', async (req, res) => {
    try {
      await sql`DELETE FROM posts WHERE id = ${parseInt(req.params.id)}`;
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/users/:id/posts', async (req, res) => {
    try {
      const posts = await sql`
        SELECT 
          p.id, p.title, p.content, p.created_at,
          u.display_name as username, 
          u.avatar_style as avatar_mood, 
          u.hair_style as avatar_hair, 
          u.skin_tone as avatar_skin, 
          u.outfit_color as avatar_outfit,
          c.name as category,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
          (SELECT COUNT(*) FROM reactions WHERE post_id = p.id) as reaction_count,
          (SELECT json_object_agg(reaction_type, count) FROM (
            SELECT reaction_type, COUNT(*) as count 
            FROM reactions 
            WHERE post_id = p.id 
            GROUP BY reaction_type
          ) s) as reactions
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        WHERE p.user_id = ${parseInt(req.params.id)}
        ORDER BY p.created_at DESC
      `;
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/users/:id/notifications', async (req, res) => {
    try {
      const notifications = await sql`
        SELECT 
          n.*, 
          u.display_name as actor_username,
          p.title as post_title
        FROM notifications n
        JOIN users u ON n.actor_id = u.id
        JOIN posts p ON n.post_id = p.id
        WHERE n.user_id = ${parseInt(req.params.id)}
        ORDER BY n.created_at DESC
      `;
      res.json(notifications);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/users/:id/notifications/unread-count', async (req, res) => {
    try {
      const result = await sql`
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE user_id = ${parseInt(req.params.id)} AND is_read = FALSE
      `;
      res.json({ count: parseInt(result[0].count) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/notifications/:id/read', async (req, res) => {
    try {
      await sql`
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE id = ${parseInt(req.params.id)}
      `;
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const result = await sql`SELECT * FROM users WHERE id = ${parseInt(req.params.id)}`;
      if (result.length === 0) return res.status(404).json({ error: 'User not found' });
      const user = result[0];
      res.json({
        id: user.id,
        username: user.display_name,
        avatar_skin: user.skin_tone,
        avatar_hair: user.hair_style,
        avatar_outfit: user.outfit_color,
        avatar_accessory: 'none',
        avatar_mood: user.avatar_style,
        bio: user.bio
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }
}

export default app;
const PORT = process.env.PORT || 3000;

startServer().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});