const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to make authenticated requests
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Something went wrong');
    }
    
    return response.json();
}

// Auth API
export const authAPI = {
    async register(username, password) {
        const data = await fetchWithAuth('/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        localStorage.setItem('token', data.token);
        return data;
    },
    
    async login(username, password) {
        const data = await fetchWithAuth('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        localStorage.setItem('token', data.token);
        return data;
    },
    
    logout() {
        localStorage.removeItem('token');
    },
    
    isAuthenticated() {
        return !!localStorage.getItem('token');
    }
};

// Files API
export const filesAPI = {
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Upload failed');
        }
        
        return response.json();
    },
    
    async getFiles() {
        return fetchWithAuth('/files');
    },
    
    async downloadFile(fileId, fileName) {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Download failed');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    },
    
    async shareFile(fileId, userId) {
        return fetchWithAuth(`/files/${fileId}/share`, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    },
    
    async createFolder(name, parentId) {
        return fetchWithAuth('/folders', {
            method: 'POST',
            body: JSON.stringify({ name, parentId })
        });
    }
};
