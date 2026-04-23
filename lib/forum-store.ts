import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { findUserById } from './user-store';

export interface StoredThread {
  id: string;
  user_id: string;
  category: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  replies_count: number;
}

export interface StoredReply {
  id: string;
  thread_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

interface ForumStore {
  threads: StoredThread[];
  replies: StoredReply[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'forum.json');

function readStore(): ForumStore {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      return { threads: [], replies: [] };
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw) as ForumStore;
  } catch {
    return { threads: [], replies: [] };
  }
}

function writeStore(store: ForumStore): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// Threads API
// ---------------------------------------------------------------------------

export function getThreads(category?: string | null) {
  const store = readStore();
  let threads = store.threads;
  
  if (category) {
    threads = threads.filter(t => t.category === category);
  }
  
  // Sort by created_at desc
  threads = [...threads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  // Populate usernames
  return threads.map(t => {
    const user = findUserById(t.user_id);
    return {
      ...t,
      username: user ? user.username : 'unknown',
    };
  });
}

export function getThreadById(id: string) {
  const store = readStore();
  const thread = store.threads.find(t => t.id === id);
  
  if (!thread) return null;
  
  const user = findUserById(thread.user_id);
  return {
    ...thread,
    username: user ? user.username : 'unknown'
  };
}

export function createThread(userId: string, category: string, title: string, body: string) {
  const store = readStore();
  
  const thread: StoredThread = {
    id: uuidv4(),
    user_id: userId,
    category,
    title,
    body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    replies_count: 0
  };
  
  store.threads.push(thread);
  writeStore(store);
  
  const user = findUserById(userId);
  return {
    ...thread,
    username: user ? user.username : 'unknown'
  };
}

// ---------------------------------------------------------------------------
// Replies API
// ---------------------------------------------------------------------------

export function getRepliesForThread(threadId: string) {
  const store = readStore();
  const replies = store.replies.filter(r => r.thread_id === threadId);
  
  // Sort by created_at asc
  replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  return replies.map(r => {
    const user = findUserById(r.user_id);
    return {
      ...r,
      username: user ? user.username : 'unknown'
    };
  });
}

export function createReply(threadId: string, userId: string, body: string) {
  const store = readStore();
  
  const reply: StoredReply = {
    id: uuidv4(),
    thread_id: threadId,
    user_id: userId,
    body,
    created_at: new Date().toISOString()
  };
  
  store.replies.push(reply);
  
  // Update replies count and updated_at on the thread
  const threadIdx = store.threads.findIndex(t => t.id === threadId);
  if (threadIdx !== -1) {
    store.threads[threadIdx].replies_count += 1;
    store.threads[threadIdx].updated_at = new Date().toISOString();
  }
  
  writeStore(store);
  
  const user = findUserById(userId);
  return {
    ...reply,
    username: user ? user.username : 'unknown'
  };
}
