const axios = require('axios');

const BASE_URL = 'http://localhost:5002';
const API_BASE = `${BASE_URL}/api/v1`;

// All identified routes from the codebase
const routes = [
  // Auth routes (no authentication required)
  { method: 'POST', path: '/auth/register', description: 'Register new user' },
  { method: 'POST', path: '/auth/login', description: 'Login user' },
  { method: 'GET', path: '/auth/verify-email', description: 'Verify email' },
  { method: 'POST', path: '/auth/forgot-password', description: 'Forgot password' },
  { method: 'POST', path: '/auth/reset-password', description: 'Reset password' },
  { method: 'POST', path: '/auth/logout', description: 'Logout user' },
  { method: 'GET', path: '/auth/google', description: 'Google OAuth (redirect)' },
  { method: 'GET', path: '/auth/google/callback', description: 'Google OAuth callback' },

  // Issue routes (authentication required)
  { method: 'POST', path: '/issues', description: 'Create issue', auth: true },
  { method: 'GET', path: '/issues', description: 'Get issues', auth: true },
  { method: 'GET', path: '/issues/search', description: 'Search issues', auth: true },
  { method: 'GET', path: '/issues/:id', description: 'Get issue by ID', auth: true },
  { method: 'PATCH', path: '/issues/:id/status', description: 'Update issue status', auth: true },
  { method: 'PATCH', path: '/issues/:id/assign', description: 'Assign issue', auth: true, role: 'MANAGEMENT' },
  { method: 'GET', path: '/issues/:id/similar', description: 'Find similar issues', auth: true, role: 'MANAGEMENT' },
  { method: 'POST', path: '/issues/:id/merge', description: 'Merge issues', auth: true, role: 'MANAGEMENT' },

  // Announcement routes (authentication required)
  { method: 'POST', path: '/announcements', description: 'Create announcement', auth: true, role: 'MANAGEMENT' },
  { method: 'GET', path: '/announcements', description: 'Get announcements', auth: true },
  { method: 'POST', path: '/announcements/:id/mark-read', description: 'Mark announcement as read', auth: true },
  { method: 'GET', path: '/announcements/unread-count', description: 'Get unread count', auth: true },

  // Comment routes (authentication required)
  { method: 'POST', path: '/comments', description: 'Create comment', auth: true },
  { method: 'GET', path: '/comments', description: 'Get comments', auth: true },
  { method: 'GET', path: '/comments/:id', description: 'Get comment by ID', auth: true },
  { method: 'PATCH', path: '/comments/:id', description: 'Update comment', auth: true },
  { method: 'DELETE', path: '/comments/:id', description: 'Delete comment', auth: true },

  // Reaction routes (authentication required)
  { method: 'POST', path: '/reactions', description: 'Add reaction', auth: true },
  { method: 'GET', path: '/reactions/counts', description: 'Get reaction counts', auth: true },
  { method: 'GET', path: '/reactions/user-reactions', description: 'Get user reactions', auth: true },
  { method: 'GET', path: '/reactions/resource', description: 'Get reactions by resource', auth: true },
  { method: 'DELETE', path: '/reactions/:id', description: 'Remove reaction', auth: true },

  // Lost & Found routes (authentication required)
  { method: 'POST', path: '/lost-found', description: 'Create lost & found item', auth: true },
  { method: 'GET', path: '/lost-found', description: 'Get lost & found items', auth: true },
  { method: 'GET', path: '/lost-found/search', description: 'Search lost & found items', auth: true },
  { method: 'GET', path: '/lost-found/claims/pending', description: 'Get pending claims', auth: true, role: 'MANAGEMENT' },
  { method: 'GET', path: '/lost-found/:id', description: 'Get lost & found item by ID', auth: true },
  { method: 'POST', path: '/lost-found/:id/claim', description: 'Claim item', auth: true },
  { method: 'PATCH', path: '/lost-found/claims/:id', description: 'Update claim status', auth: true, role: 'MANAGEMENT' },
  { method: 'PATCH', path: '/lost-found/:id/returned', description: 'Mark item as returned', auth: true, role: 'MANAGEMENT' },

  // Analytics routes (authentication + management role required)
  { method: 'GET', path: '/analytics/dashboard', description: 'Get dashboard overview', auth: true, role: 'MANAGEMENT' },
  { method: 'GET', path: '/analytics/categories', description: 'Get category breakdown', auth: true, role: 'MANAGEMENT' },
  { method: 'GET', path: '/analytics/hostels', description: 'Get hostel comparison', auth: true, role: 'MANAGEMENT' },
  { method: 'GET', path: '/analytics/trends', description: 'Get issue trends', auth: true, role: 'MANAGEMENT' },
  { method: 'GET', path: '/analytics/rooms', description: 'Get top rooms', auth: true, role: 'MANAGEMENT' },
  { method: 'GET', path: '/analytics/peak-hours', description: 'Get peak reporting hours', auth: true, role: 'MANAGEMENT' },
  { method: 'GET', path: '/analytics/staff-performance', description: 'Get staff performance', auth: true, role: 'MANAGEMENT' },

  // Notification routes (authentication required)
  { method: 'GET', path: '/notifications', description: 'Get notifications', auth: true },
  { method: 'PATCH', path: '/notifications/:id/read', description: 'Mark notification as read', auth: true },
  { method: 'PATCH', path: '/notifications/mark-all-read', description: 'Mark all notifications as read', auth: true },
  { method: 'GET', path: '/notifications/unread-count', description: 'Get unread count', auth: true }
];

async function testRoute(route) {
  try {
    const url = `${API_BASE}${route.path.replace(':id', 'test-id')}`;
    
    // For GET requests, we can test without a body
    // For POST/PATCH/DELETE, we'll test the route existence but expect validation errors
    const config = {
      method: route.method.toLowerCase(),
      url: url,
      timeout: 5000,
      headers: {}
    };

    // Add dummy auth token for protected routes (will fail but should show route exists)
    if (route.auth) {
      config.headers.Authorization = 'Bearer dummy-token-for-testing';
    }

    // Add dummy body for POST/PATCH requests
    if (['post', 'patch'].includes(config.method)) {
      config.data = { test: 'data' };
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    
    return {
      route: `${route.method} ${route.path}`,
      status: response.status,
      success: true,
      description: route.description,
      note: route.auth ? 'Route accessible (with proper auth)' : 'Route accessible'
    };
  } catch (error) {
    // Consider 401, 403, 400 as "route exists but requires auth/validation"
    if (error.response && [400, 401, 403, 422].includes(error.response.status)) {
      return {
        route: `${route.method} ${route.path}`,
        status: error.response.status,
        success: true,
        description: route.description,
        note: 'Route exists (requires auth/validation)'
      };
    }
    
    // Consider 404 as route not found
    if (error.response && error.response.status === 404) {
      return {
        route: `${route.method} ${route.path}`,
        status: error.response.status,
        success: false,
        description: route.description,
        note: 'Route not found'
      };
    }

    // Network errors, timeouts, etc.
    return {
      route: `${route.method} ${route.path}`,
      status: 'ERROR',
      success: false,
      description: route.description,
      note: error.code === 'ECONNREFUSED' ? 'Server not running' : error.message
    };
  }
}

async function testAllRoutes() {
  console.log('🔍 Testing Smart Hostel Management Backend Routes\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API Base: ${API_BASE}\n`);

  const results = [];
  
  for (const route of routes) {
    const result = await testRoute(route);
    results.push(result);
    
    const status = result.success ? '✅' : '❌';
    const statusText = typeof result.status === 'number' ? `${result.status}` : result.status;
    console.log(`${status} ${result.route.padEnd(30)} ${statusText.padEnd(8)} ${result.note}`);
  }

  // Summary
  const total = results.length;
  const working = results.filter(r => r.success).length;
  const notWorking = total - working;
  
  console.log('\n📊 SUMMARY');
  console.log('=====================================');
  console.log(`Total routes: ${total}`);
  console.log(`Working: ${working} ✅`);
  console.log(`Not working: ${notWorking} ❌`);
  console.log(`Success rate: ${((working / total) * 100).toFixed(1)}%`);

  // Categorize by module
  console.log('\n📋 BY MODULE');
  console.log('=====================================');
  
  const modules = {
    'Auth': results.filter(r => r.route.includes('/auth')),
    'Issues': results.filter(r => r.route.includes('/issues')),
    'Announcements': results.filter(r => r.route.includes('/announcements')),
    'Comments': results.filter(r => r.route.includes('/comments')),
    'Reactions': results.filter(r => r.route.includes('/reactions')),
    'Lost & Found': results.filter(r => r.route.includes('/lost-found')),
    'Analytics': results.filter(r => r.route.includes('/analytics')),
    'Notifications': results.filter(r => r.route.includes('/notifications'))
  };

  Object.entries(modules).forEach(([module, routes]) => {
    const working = routes.filter(r => r.success).length;
    const total = routes.length;
    const rate = ((working / total) * 100).toFixed(1);
    console.log(`${module.padEnd(15)} ${working}/${total} (${rate}%)`);
  });
}

// Test health endpoint first
async function testHealth() {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    console.log('✅ Server Health Check: PASSED');
    console.log(`Status: ${response.status}`);
    console.log(`Data: ${JSON.stringify(response.data, null, 2)}\n`);
    return true;
  } catch (error) {
    console.log('❌ Server Health Check: FAILED');
    console.log(`Error: ${error.message}\n`);
    return false;
  }
}

async function main() {
  const isServerRunning = await testHealth();
  
  if (!isServerRunning) {
    console.log('❌ Please start the server first: npm run dev');
    process.exit(1);
  }

  await testAllRoutes();
}

main().catch(console.error);