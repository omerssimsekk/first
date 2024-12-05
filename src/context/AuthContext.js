import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);

  const login = (username, password) => {
    if (username === 'test' && password === 'test') {
      setUserInfo({
        username: 'test',
        name: 'Test User'
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUserInfo(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
