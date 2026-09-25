const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const token = await window.Clerk?.session?.getToken();

  console.log(
    `[API] ${options.method || 'GET'} ${path} — token present:`,
    !!token
  );

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  console.log(
    `[API] ${options.method || 'GET'} ${path} — status:`,
    response.status
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));

    console.error(
      `[API] ${options.method || 'GET'} ${path} — error body:`,
      errorBody
    );

    throw new Error(
      errorBody.detail || `Request failed: ${response.status}`
    );
  }

  return response.json();
}

export const getEmployees = () =>
  request('/employees');

export const recordScore = (employeeId, activity) =>
  request(`/employees/${employeeId}/scores`, {
    method: 'POST',
    body: JSON.stringify({ activity }),
  });

export const getEmployeeScores = (employeeId) =>
  request(`/employees/${employeeId}/scores`);

export const getLeaderboard = () =>
  request('/leaderboard');

export const getStats = () =>
  request('/stats');

export const getActivities = () =>
  request('/activities');

export const getMe = () =>
  request('/me');

export const createAccessRequest = () =>
  request('/access-requests', {
    method: 'POST',
  });

export const getMyAccessRequest = () =>
  request('/access-requests/me');

export const getAccessRequests = (status) =>
  request(
    `/admin/access-requests${status ? `?status=${status}` : ''}`
  );

export const approveAccessRequest = (id) =>
  request(`/admin/access-requests/${id}/approve`, {
    method: 'POST',
  });

export const rejectAccessRequest = (id) =>
  request(`/admin/access-requests/${id}/reject`, {
    method: 'POST',
  });