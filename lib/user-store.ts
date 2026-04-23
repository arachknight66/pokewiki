/**
 * File-based user store — replaces PostgreSQL for authentication.
 * Persists users and refresh tokens to data/users.json.
 * Works out of the box with zero external dependencies.
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StoredUser {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  profile_bio: string | null;
  avatar_url: string | null;
  preferences: { theme: 'light' | 'dark'; notifications: boolean };
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export interface StoredRefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked: boolean;
  created_at: string;
}

interface Store {
  users: StoredUser[];
  refresh_tokens: StoredRefreshToken[];
}

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'users.json');

function readStore(): Store {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      return { users: [], refresh_tokens: [] };
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw) as Store;
  } catch {
    return { users: [], refresh_tokens: [] };
  }
}

function writeStore(store: Store): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// User CRUD
// ---------------------------------------------------------------------------

export function findUserByEmail(email: string): StoredUser | null {
  const store = readStore();
  return store.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.is_active
  ) ?? null;
}

export function findUserByUsername(username: string): StoredUser | null {
  const store = readStore();
  return store.users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  ) ?? null;
}

export function findUserById(id: string): StoredUser | null {
  const store = readStore();
  return store.users.find((u) => u.id === id) ?? null;
}

export interface CreateUserInput {
  email: string;
  username: string;
  passwordHash: string;
}

export function createUser(input: CreateUserInput): StoredUser {
  const store = readStore();

  const user: StoredUser = {
    id: uuidv4(),
    email: input.email.toLowerCase(),
    username: input.username,
    password_hash: input.passwordHash,
    profile_bio: null,
    avatar_url: null,
    preferences: { theme: 'light', notifications: true },
    email_verified: false,
    is_active: true,
    created_at: new Date().toISOString(),
    last_login: null,
  };

  store.users.push(user);
  writeStore(store);
  return user;
}

export function updateLastLogin(userId: string): void {
  const store = readStore();
  const idx = store.users.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    store.users[idx].last_login = new Date().toISOString();
    writeStore(store);
  }
}

// ---------------------------------------------------------------------------
// Refresh Token helpers
// ---------------------------------------------------------------------------

export async function storeRefreshTokenLocal(
  userId: string,
  token: string
): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const tokenHash = await bcrypt.hash(token, salt);
  const store = readStore();

  const entry: StoredRefreshToken = {
    id: uuidv4(),
    user_id: userId,
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    revoked: false,
    created_at: new Date().toISOString(),
  };

  store.refresh_tokens.push(entry);
  writeStore(store);
  return entry.id;
}

export async function verifyRefreshTokenLocal(
  userId: string,
  token: string
): Promise<boolean> {
  const store = readStore();
  const now = new Date();

  // Find the latest non-revoked, non-expired token for this user
  const candidates = store.refresh_tokens
    .filter(
      (t) =>
        t.user_id === userId &&
        !t.revoked &&
        new Date(t.expires_at) > now
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  for (const candidate of candidates) {
    const match = await bcrypt.compare(token, candidate.token_hash);
    if (match) return true;
  }

  return false;
}

export function revokeRefreshTokenLocal(userId: string): void {
  const store = readStore();
  for (const t of store.refresh_tokens) {
    if (t.user_id === userId && !t.revoked) {
      t.revoked = true;
    }
  }
  writeStore(store);
}
