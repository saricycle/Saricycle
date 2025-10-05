import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, get, child, update } from 'firebase/database';
import { logAccountCreation } from '../../firebase/activities';
import { initializeUserAchievements } from '../../firebase/achievements';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for stored authentication on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('saricycle_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('saricycle_user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Hardcoded admin credentials for development
      if (email === 'dev@dev.com' && password === 'dev123') {
        const adminInfo = {
          userID: 'dev-admin-001',
          username: 'Dev Admin',
          email: 'dev@dev.com',
          usertype: 'admin',
          points: 0,
          address: 'Development',
          category: 'Admins'
        };
        setUser(adminInfo);
        setIsAuthenticated(true);
        localStorage.setItem('saricycle_user', JSON.stringify(adminInfo));
        setLoading(false);
        return { success: true, user: adminInfo };
      }

      const dbRef = ref(database);
      
      // Check in Users table
      const usersSnapshot = await get(child(dbRef, 'Users'));
      if (usersSnapshot.exists()) {
        const users = usersSnapshot.val();
        for (const [userID, userData] of Object.entries(users)) {
          if (userData.email === email && userData.password === password) {
            const userInfo = {
              userID,
              username: userData.username,
              email: userData.email,
              usertype: userData.usertype || 'user',
              points: userData.points || 0,
              address: userData.address || '',
              category: 'Users'
            };
            setUser(userInfo);
            setIsAuthenticated(true);
            localStorage.setItem('saricycle_user', JSON.stringify(userInfo));
            setLoading(false);
            return { success: true, user: userInfo };
          }
        }
      }

      // Check in Admins table
      const adminsSnapshot = await get(child(dbRef, 'Admins'));
      if (adminsSnapshot.exists()) {
        const admins = adminsSnapshot.val();
        for (const [userID, userData] of Object.entries(admins)) {
          if (userData.email === email && userData.password === password) {
            const userInfo = {
              userID,
              username: userData.username,
              email: userData.email,
              usertype: userData.usertype || 'admin',
              points: userData.points || 0,
              address: userData.address || '',
              category: 'Admins'
            };
            setUser(userInfo);
            setIsAuthenticated(true);
            localStorage.setItem('saricycle_user', JSON.stringify(userInfo));
            setLoading(false);
            return { success: true, user: userInfo };
          }
        }
      }

      // Check in Barangay table
      const barangaySnapshot = await get(child(dbRef, 'Barangay'));
      if (barangaySnapshot.exists()) {
        const barangayUsers = barangaySnapshot.val();
        for (const [userID, userData] of Object.entries(barangayUsers)) {
          if (userData.email === email && userData.password === password) {
            const userInfo = {
              userID,
              username: userData.username,
              email: userData.email,
              usertype: userData.usertype || 'barangay',
              points: userData.points || 0,
              address: userData.address || '',
              category: 'Barangay'
            };
            setUser(userInfo);
            setIsAuthenticated(true);
            localStorage.setItem('saricycle_user', JSON.stringify(userInfo));
            setLoading(false);
            return { success: true, user: userInfo };
          }
        }
      }

      setLoading(false);
      return { success: false, message: 'Invalid email or password' };
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  // Register function
  const register = async (username, email, password, usertype = 'user', address = '') => {
    setLoading(true);
    try {
      const dbRef = ref(database);
      
      // Check if email already exists in any table
      const checkTables = ['Users', 'Admins', 'Barangay'];
      for (const table of checkTables) {
        const snapshot = await get(child(dbRef, table));
        if (snapshot.exists()) {
          const users = snapshot.val();
          for (const userData of Object.values(users)) {
            if (userData.email === email) {
              setLoading(false);
              return { success: false, message: 'Email already exists' };
            }
          }
        }
      }

      // Determine which table to use based on usertype
      const getTableName = (type) => {
        switch (type.toLowerCase()) {
          case 'admin':
            return 'Admins';
          case 'barangay':
            return 'Barangay';
          default:
            return 'Users';
        }
      };

      const tableName = getTableName(usertype);
      const { ref: firebaseRef, push } = await import('firebase/database');
      
      const usersRef = firebaseRef(database, tableName);
      const newUserRef = await push(usersRef, {
        username,
        email,
        password,
        usertype,
        address,
        points: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const userInfo = {
        userID: newUserRef.key,
        username,
        email,
        usertype,
        points: 0,
        address,
        category: tableName
      };

      // Log account creation activity and initialize achievements for regular users
      if (usertype === 'user') {
        try {
          await logAccountCreation(newUserRef.key);
          await initializeUserAchievements(newUserRef.key);
        } catch (activityError) {
          console.error('Error logging account creation activity or initializing achievements:', activityError);
          // Don't fail registration if activity logging or achievement initialization fails
        }
      }

      setUser(userInfo);
      setIsAuthenticated(true);
      localStorage.setItem('saricycle_user', JSON.stringify(userInfo));
      setLoading(false);
      return { success: true, user: userInfo };
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('saricycle_user');
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && (user.usertype === 'admin' || user.category === 'Admins');
  };

  // Check if user is regular user
  const isUser = () => {
    return user && (user.usertype === 'user' || user.category === 'Users');
  };

  // Check if user is barangay
  const isBarangay = () => {
    return user && (user.usertype === 'barangay' || user.category === 'Barangay');
  };

  // Update user points (useful after redemptions or earning points)
  const updateUserPoints = (newPoints) => {
    if (user) {
      const updatedUser = { ...user, points: newPoints };
      setUser(updatedUser);
      localStorage.setItem('saricycle_user', JSON.stringify(updatedUser));
    }
  };

  // Update user profile data
  const updateUserProfile = async (updateData) => {
    if (!user?.userID || !user?.category) return { success: false, message: 'User not found' };

    try {
      const userRef = ref(database, `${user.category}/${user.userID}`);
      await update(userRef, updateData);
      
      // Update local state
      const updatedUser = { ...user, ...updateData };
      setUser(updatedUser);
      localStorage.setItem('saricycle_user', JSON.stringify(updatedUser));
      
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, message: 'Failed to update profile' };
    }
  };

  // Refresh user data from Firebase
  const refreshUserData = async () => {
    if (!user?.userID || !user?.category) return;

    try {
      const dbRef = ref(database);
      const userSnapshot = await get(child(dbRef, `${user.category}/${user.userID}`));
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        const updatedUser = {
          ...user,
          points: userData.points || 0,
          username: userData.username,
          email: userData.email,
          address: userData.address || '',
          password: userData.password
        };
        setUser(updatedUser);
        localStorage.setItem('saricycle_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    isAdmin,
    isUser,
    isBarangay,
    updateUserPoints,
    updateUserProfile,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 