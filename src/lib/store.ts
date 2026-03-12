import { Project, Post, CalendarSlot, SwipeFile, ChatMessage } from './types';

const KEYS = {
  projects: 'postcreate_projects',
  posts: 'postcreate_posts',
  calendar: 'postcreate_calendar',
  swipeFiles: 'postcreate_swipe_files',
  chatMessages: 'postcreate_chat_messages',
};

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function load<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Projects ──

export function getProjects(): Project[] {
  return load<Project>(KEYS.projects);
}

export function getProject(id: string): Project | undefined {
  return getProjects().find(p => p.id === id);
}

export function saveProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
  const now = new Date().toISOString();
  const newProject: Project = { ...project, id: uid(), createdAt: now, updatedAt: now };
  const all = getProjects();
  all.push(newProject);
  save(KEYS.projects, all);
  return newProject;
}

export function updateProject(id: string, updates: Partial<Project>): void {
  const all = getProjects();
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
  save(KEYS.projects, all);
}

export function deleteProject(id: string): void {
  save(KEYS.projects, getProjects().filter(p => p.id !== id));
  save(KEYS.posts, getPosts().filter(p => p.projectId !== id));
  save(KEYS.calendar, getCalendarSlots(id).length > 0 ? load<CalendarSlot>(KEYS.calendar).filter(s => s.projectId !== id) : []);
  save(KEYS.chatMessages, load<ChatMessage>(KEYS.chatMessages).filter(m => {
    const post = getPost(m.postId);
    return post && post.projectId !== id;
  }));
}

// ── Posts ──

export function getPosts(projectId?: string): Post[] {
  const all = load<Post>(KEYS.posts);
  return projectId ? all.filter(p => p.projectId === projectId) : all;
}

export function getPost(id: string): Post | undefined {
  return load<Post>(KEYS.posts).find(p => p.id === id);
}

export function savePost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Post {
  const now = new Date().toISOString();
  const newPost: Post = { ...post, id: uid(), createdAt: now, updatedAt: now };
  const all = load<Post>(KEYS.posts);
  all.push(newPost);
  save(KEYS.posts, all);
  return newPost;
}

export function updatePost(id: string, updates: Partial<Post>): void {
  const all = load<Post>(KEYS.posts);
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
  save(KEYS.posts, all);
}

export function deletePost(id: string): void {
  save(KEYS.posts, load<Post>(KEYS.posts).filter(p => p.id !== id));
  save(KEYS.chatMessages, load<ChatMessage>(KEYS.chatMessages).filter(m => m.postId !== id));
}

// ── Calendar ──

export function getCalendarSlots(projectId: string): CalendarSlot[] {
  return load<CalendarSlot>(KEYS.calendar).filter(s => s.projectId === projectId);
}

export function saveCalendarSlot(slot: Omit<CalendarSlot, 'id'>): CalendarSlot {
  const newSlot: CalendarSlot = { ...slot, id: uid() };
  const all = load<CalendarSlot>(KEYS.calendar);
  all.push(newSlot);
  save(KEYS.calendar, all);
  return newSlot;
}

export function updateCalendarSlot(id: string, updates: Partial<CalendarSlot>): void {
  const all = load<CalendarSlot>(KEYS.calendar);
  const idx = all.findIndex(s => s.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...updates };
  save(KEYS.calendar, all);
}

export function deleteCalendarSlot(id: string): void {
  save(KEYS.calendar, load<CalendarSlot>(KEYS.calendar).filter(s => s.id !== id));
}

// ── Swipe Files ──

export function getSwipeFiles(): SwipeFile[] {
  return load<SwipeFile>(KEYS.swipeFiles);
}

export function saveSwipeFile(file: Omit<SwipeFile, 'id' | 'createdAt'>): SwipeFile {
  const newFile: SwipeFile = { ...file, id: uid(), createdAt: new Date().toISOString() };
  const all = getSwipeFiles();
  all.push(newFile);
  save(KEYS.swipeFiles, all);
  return newFile;
}

export function deleteSwipeFile(id: string): void {
  save(KEYS.swipeFiles, getSwipeFiles().filter(f => f.id !== id));
}

// ── Chat Messages ──

export function getChatMessages(postId: string): ChatMessage[] {
  return load<ChatMessage>(KEYS.chatMessages).filter(m => m.postId === postId);
}

export function saveChatMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
  const newMsg: ChatMessage = { ...msg, id: uid(), timestamp: new Date().toISOString() };
  const all = load<ChatMessage>(KEYS.chatMessages);
  all.push(newMsg);
  save(KEYS.chatMessages, all);
  return newMsg;
}
