import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<User>;
  register: (userData: Partial<User> & { password: string }) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (authError) throw new Error(authError.message);
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        if (profileError) throw new Error(profileError.message);
        
        const user = {
          id: profile.id,
          email: authData.user.email!,
          name: profile.name,
          role: profile.role,
          restaurantName: profile.restaurant_name,
          phone: profile.phone,
          address: profile.address,
          createdAt: profile.created_at,
        };
        
        set({ user, isAuthenticated: true });
        return user;
      },
      
      register: async (userData) => {
        const { email, password, name, role, restaurantName, phone, address } = userData;
        
        try {
          // Create auth user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email!,
            password: password!,
          });
          
          if (authError) throw new Error(authError.message);
          if (!authData.user) throw new Error('No user returned from signup');
          
          // Create profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authData.user.id,
                name,
                role,
                restaurant_name: restaurantName,
                phone,
                address,
              },
            ])
            .select()
            .single();
          
          if (profileError) {
            // Instead of trying to delete the auth user (which requires admin privileges),
            // we'll let the automatic cleanup process handle orphaned auth users
            throw new Error(profileError.message);
          }
          
          const user = {
            id: profile.id,
            email: authData.user.email!,
            name: profile.name,
            role: profile.role,
            restaurantName: profile.restaurant_name,
            phone: profile.phone,
            address: profile.address,
            createdAt: profile.created_at,
          };
          
          set({ user, isAuthenticated: true });
          return user;
        } catch (error) {
          // If any error occurs during registration, throw it to be handled by the UI
          throw error;
        }
      },
      
      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },
      
      updateUser: async (userData) => {
        const currentUser = get().user;
        if (!currentUser) throw new Error('No user logged in');
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .update({
            name: userData.name,
            phone: userData.phone,
            address: userData.address,
            restaurant_name: userData.restaurantName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentUser.id)
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        
        const updatedUser = {
          ...currentUser,
          ...userData,
        };
        
        set({ user: updatedUser });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);