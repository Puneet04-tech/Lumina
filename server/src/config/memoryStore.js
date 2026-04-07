/**
 * In-Memory Store for Offline Development Mode
 * Used when MongoDB is unavailable
 */

let filesStore = [];
let usersStore = [
  {
    _id: 'dev-user-1',
    email: 'test@example.com',
    password: 'hashed_password',
    username: 'testuser'
  }
];
let dashboardsStore = [];

let fileIdCounter = 1;

export const memoryStore = {
  // FILE OPERATIONS
  createFile: (fileData) => {
    const id = `file-${fileIdCounter++}`;
    const file = { _id: id, ...fileData, createdAt: new Date() };
    filesStore.push(file);
    return file;
  },

  getFileById: (id) => {
    return filesStore.find(f => f._id === id);
  },

  getFilesByUser: (userId) => {
    return filesStore.filter(f => f.userId === userId);
  },

  deleteFile: (id) => {
    const index = filesStore.findIndex(f => f._id === id);
    if (index > -1) {
      filesStore.splice(index, 1);
      return true;
    }
    return false;
  },

  // USER OPERATIONS
  findUserByEmail: (email) => {
    return usersStore.find(u => u.email === email);
  },

  createUser: (userData) => {
    const user = { _id: `user-${Date.now()}`, ...userData, createdAt: new Date() };
    usersStore.push(user);
    return user;
  },

  getUserById: (id) => {
    return usersStore.find(u => u._id === id);
  },

  // DASHBOARD OPERATIONS
  createDashboard: (dashboardData) => {
    const dashboard = { _id: `dashboard-${Date.now()}`, ...dashboardData, createdAt: new Date() };
    dashboardsStore.push(dashboard);
    return dashboard;
  },

  getDashboardsByUser: (userId) => {
    return dashboardsStore.filter(d => d.userId === userId);
  },

  // UTILITY
  clear: () => {
    filesStore = [];
    dashboardsStore = [];
  }
};
