import { useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged, type User } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function useAdmin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for simple admin auth first
    const adminAuth = localStorage.getItem('admin_auth');
    if (adminAuth === 'true') {
      setUser({
        uid: 'admin',
        displayName: 'Admin',
        email: 'admin@aimfitgym.com',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
      } as User);
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          // Check if user is admin in Firestore or matches the default admin email
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const role = userDoc.data()?.role;
          
          const isDefaultAdmin = currentUser.email === "faisal.hassan.0996@gmail.com";
          setIsAdmin(role === 'admin' || isDefaultAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, isAdmin, loading };
}
