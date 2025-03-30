
import { createContext, useState, useEffect, useContext, ReactNode } from "react";

interface User {
  name: string;
  email: string;
  goals: string;
  preferredTopics: string[];
  isRegistered: boolean;
}

interface UserContextType {
  user: User;
  updateUser: (data: Partial<User>) => void;
  registerUser: (data: Omit<User, "isRegistered">) => void;
  isAuthenticated: boolean;
}

const initialUser: User = {
  name: "",
  email: "",
  goals: "",
  preferredTopics: [],
  isRegistered: false,
};

const UserContext = createContext<UserContextType>({
  user: initialUser,
  updateUser: () => {},
  registerUser: () => {},
  isAuthenticated: false,
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("studyMapUser");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(parsedUser.isRegistered);
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("studyMapUser", JSON.stringify(user));
  }, [user]);

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  const registerUser = (data: Omit<User, "isRegistered">) => {
    setUser({ ...data, isRegistered: true });
    setIsAuthenticated(true);
  };

  return (
    <UserContext.Provider value={{ user, updateUser, registerUser, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};
