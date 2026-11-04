import type {
  User,
  QuestionRecord,
  StudyPack,
  StudyPackSummaryItem,
  DemoAccount,
} from '../types/index.js';

const TOKEN_KEY = 'studypack_auth_token';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

export const api = {
  // Auth
  async register(data: { name: string; email: string; password: string; selected_class: number }): Promise<{ token: string; user: User }> {
    const res = await fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    authStorage.setToken(json.token);
    return json;
  },

  async login(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    authStorage.setToken(json.token);
    return json;
  },

  async getMe(): Promise<User | null> {
    const token = authStorage.getToken();
    if (!token) return null;
    const res = await fetchWithAuth('/api/auth/me');
    if (!res.ok) {
      authStorage.clearToken();
      return null;
    }
    const json = await res.json();
    return json.user;
  },

  async logout(): Promise<void> {
    try {
      await fetchWithAuth('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      authStorage.clearToken();
    }
  },

  async updateClass(selected_class: number): Promise<{ selected_class: number; message: string }> {
    const res = await fetchWithAuth('/api/auth/class', {
      method: 'PUT',
      body: JSON.stringify({ selected_class }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update class');
    return json;
  },

  async updateProfile(name: string): Promise<{ name: string }> {
    const res = await fetchWithAuth('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update profile');
    return json;
  },

  // Ask AI
  async askQuestion(data: { question: string; subject?: string }): Promise<QuestionRecord> {
    const res = await fetchWithAuth('/api/ask', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to get answer');
    return json;
  },

  async getQuestionHistory(): Promise<QuestionRecord[]> {
    const res = await fetchWithAuth('/api/ask/history');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch history');
    return json.questions;
  },

  async deleteQuestion(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/ask/history/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete question');
  },

  // Study Packs
  async generateStudyPack(payload: {
    userPromptTitle?: string;
    textContent?: string;
    fileBufferBase64?: string;
    mimeType?: string;
    fileName?: string;
    fileType?: string;
  }): Promise<StudyPack> {
    const res = await fetchWithAuth('/api/studypacks/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to generate study pack');
    return json;
  },

  async getStudyPacks(): Promise<StudyPackSummaryItem[]> {
    const res = await fetchWithAuth('/api/studypacks');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch study packs');
    return json.studyPacks;
  },

  async getStudyPackById(id: string): Promise<StudyPack> {
    const res = await fetchWithAuth(`/api/studypacks/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to load study pack');
    return json;
  },

  async deleteStudyPack(id: string): Promise<void> {
    const res = await fetchWithAuth(`/api/studypacks/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete study pack');
  },

  async getDemoAccounts(): Promise<DemoAccount[]> {
    const res = await fetch('/api/demo-accounts');
    const json = await res.json();
    return json.accounts || [];
  },
};
