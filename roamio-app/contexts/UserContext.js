import React, { createContext, useState, useContext } from "react";

// Create a Context for the user
const UserContext = createContext();

// Provider component to wrap the app
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    email: "",
    // other fields can be added (name, token, etc.)
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for easy access
export const useUser = () => useContext(UserContext);
