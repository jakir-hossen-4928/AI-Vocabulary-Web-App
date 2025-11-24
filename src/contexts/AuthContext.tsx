import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);

      if (user) {
        try {
          const { setDoc, serverTimestamp } = await import('firebase/firestore');
          const userRef = doc(db, 'user_roles', user.uid);

          console.log('Checking user_roles for:', user.uid);
          const roleDoc = await getDoc(userRef);

          // Data to update or set
          const userData = {
            email: user.email,
            photoURL: user.photoURL,
            displayName: user.displayName,
            lastLogin: serverTimestamp(),
          };

          if (!roleDoc.exists()) {
            // Create new user document
            console.log('Creating new user in user_roles:', user.uid);
            await setDoc(userRef, {
              ...userData,
              role: 'user',
              createdAt: serverTimestamp()
            });
            console.log('User created successfully in user_roles');
            setIsAdmin(false);
          } else {
            // Update existing user document with latest auth profile
            console.log('Updating existing user in user_roles:', user.uid);
            await setDoc(userRef, userData, { merge: true });
            console.log('User updated successfully in user_roles');
            setIsAdmin(roleDoc.data()?.role === 'admin');
          }
        } catch (error) {
          console.error('Error managing user_roles:', error);
          // Still set isAdmin to false on error
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
