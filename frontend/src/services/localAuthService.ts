import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

const USERS_KEY = 'local_users';
const SESSION_KEY = 'token';

function generateId(): string {
  return 'local_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateToken(user: User): string {
  const payload = { id: user.id, email: user.email, t: Date.now() };
  return 'local_' + btoa(JSON.stringify(payload));
}

function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

export const localAuthService = {
  register(data: RegisterRequest): AuthResponse {
    const users = getUsers();
    if (users.find(u => u.email === data.email)) {
      throw new Error('User with this email already exists');
    }
    const user: User = {
      id: generateId(),
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      enabledRoles: ['client', 'provider'],
      activeRole: data.role,
      profileCompleted: false,
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const entry = { ...user, _password: hashPassword(data.password) };
    users.push(entry);
    saveUsers(users);
    const token = generateToken(user);
    return { user, token };
  },

  login(data: LoginRequest): AuthResponse {
    const users = getUsers();
    const found = users.find(u => u.email === data.email);
    if (!found) {
      throw new Error('Invalid email or password');
    }
    const stored = found as User & { _password?: string };
    if (stored._password !== hashPassword(data.password)) {
      throw new Error('Invalid email or password');
    }
    const { _password, ...user } = stored;
    const token = generateToken(user);
    return { user, token };
  },

  getMe(): User | null {
    try {
      const token = localStorage.getItem(SESSION_KEY);
      if (!token || !token.startsWith('local_')) return null;
      const payload = JSON.parse(atob(token.slice(6)));
      const users = getUsers();
      return users.find(u => u.id === payload.id) || null;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('user');
  },

  isLocalSession(): boolean {
    const token = localStorage.getItem(SESSION_KEY);
    return !!token && token.startsWith('local_');
  },
};
