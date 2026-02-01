const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(),
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.access_token);
    return response;
  }

  logout() {
    this.clearToken();
    window.location.href = '/';
  }

  // Teacher APIs
  async teacherQueryText(queryText, chatHistory = []) {
    return await this.request('/api/teacher/query', {
      method: 'POST',
      body: JSON.stringify({ 
        query_text: queryText,
        chat_history: chatHistory 
      }),
    });
  }

  async teacherQueryVoice(audioFile, chatHistory = []) {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('chat_history', JSON.stringify(chatHistory));

    const url = `${API_BASE_URL}/api/teacher/query-voice`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Voice query failed');
    }

    return await response.json();
  }

  async getTeacherHistory() {
    return await this.request('/api/teacher/history');
  }

  async clearConversationMemory() {
    return await this.request('/api/teacher/clear-memory', {
      method: 'POST',
    });
  }

  async getTeacherProfile() {
    return await this.request('/api/teacher/profile');
  }

  // CRP APIs
  async getCRPTeachers() {
    return await this.request('/api/crp/teachers');
  }

  async getCRPChats() {
    return await this.request('/api/crp/chats');
  }

  async getTeacherChats(teacherId) {
    return await this.request(`/api/crp/teacher/${teacherId}/chats`);
  }

  async getCRPAnalytics() {
    return await this.request('/api/crp/analytics');
  }
}

export default new ApiService();
