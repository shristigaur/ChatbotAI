const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('funny_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
};

export const api = {
  // Profiles
  createProfile: (data) => fetch(`${getBaseUrl()}/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  getProfile: () => fetch(`${getBaseUrl()}/profiles/me`, {
    headers: getHeaders()
  }).then(handleResponse),

  updateProfile: (data) => fetch(`${getBaseUrl()}/profiles/me`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(handleResponse),

  deleteProfile: () => fetch(`${getBaseUrl()}/profiles/me`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),

  // Conversations
  getConversations: () => fetch(`${getBaseUrl()}/conversations`, {
    headers: getHeaders()
  }).then(handleResponse),

  createConversation: () => fetch(`${getBaseUrl()}/conversations`, {
    method: 'POST',
    headers: getHeaders()
  }).then(handleResponse),

  getConversation: (id) => fetch(`${getBaseUrl()}/conversations/${id}`, {
    headers: getHeaders()
  }).then(handleResponse),

  deleteConversation: (id) => fetch(`${getBaseUrl()}/conversations/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),

  deleteAllConversations: () => fetch(`${getBaseUrl()}/conversations`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(handleResponse),

  // Messages
  sendMessage: (conversationId, text) => fetch(`${getBaseUrl()}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ text })
  }).then(handleResponse)
};
