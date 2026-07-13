import { create } from 'zustand';

// Initialize auth state from localStorage
const initializeAuth = () => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    const restaurant = localStorage.getItem('restaurant_data');
    return {
        user: user ? JSON.parse(user) : null,
        token: token || null,
        restaurant: restaurant ? JSON.parse(restaurant) : null,
        isAuthenticated: !!token,
    };
};

export const useAuthStore = create((set, get) => ({
    ...initializeAuth(),
    
    // Login action
    login: ({ user, token, restaurant }) => {
        // Save to localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        if (restaurant) {
            localStorage.setItem('restaurant_data', JSON.stringify(restaurant));
        }
        
        set({ 
            user, 
            token,
            restaurant,
            isAuthenticated: true 
        });
    },
    
    // Logout action
    logout: () => {
        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('restaurant_data');
        
        set({ 
            user: null, 
            token: null,
            restaurant: null,
            isAuthenticated: false 
        });
    },

    // Update restaurant data in state and localStorage (used when settings change)
    updateRestaurant: (updatedFields) => {
        const current = JSON.parse(localStorage.getItem('restaurant_data') || 'null');
        const updated = { ...current, ...updatedFields };
        localStorage.setItem('restaurant_data', JSON.stringify(updated));
        set((state) => ({ restaurant: { ...state.restaurant, ...updatedFields } }));
    },
    
    // Get authorization header for API requests
    getAuthHeader: () => {
        const { token } = get();
        return token ? { Authorization: `Bearer ${token}` } : {};
    },
    
    // Check if user is authenticated
    checkAuth: () => {
        const { token } = get();
        return !!token;
    }
}));
