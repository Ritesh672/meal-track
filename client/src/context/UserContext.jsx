import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../config/axiosInstance';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    setLoading(true);
    if (user) {
      try {
        const res = await axiosInstance.get('/user/profile');
        const data = res.data;
        // Map backend data to frontend structure
        setUserData({
          name: data.profile?.full_name || user.email,
          age: data.profile?.age,
          gender: data.profile?.gender,
          weight: data.profile?.current_weight_kg,
          height: data.profile?.height_cm,
          activityLevel: data.goals?.activity_level,
          goal: data.goals?.goal_type,
          onboarded: !!data.profile?.age, 
          // Use AI targets from backend
          calorieTarget: data.nutrition?.daily_calories || 2000,
          proteinTarget: data.nutrition?.daily_protein_g,
          carbsTarget: data.nutrition?.daily_carbs_g,
          fatTarget: data.nutrition?.daily_fats_g,
        });
      } catch (err) {
        console.error('Error fetching user data', err);
      }
    } else {
      setUserData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const updateUser = async (data) => {
    // Optimistic update
    setUserData(prev => ({ 
        ...prev, 
        ...data,
        name: data.fullName || data.name || prev?.name 
    }));

    const retryRequest = async (fn, retries = 3, delay = 1000) => {
        try {
            return await fn();
        } catch (err) {
            if (retries === 0) throw err;
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryRequest(fn, retries - 1, delay * 2);
        }
    };

    try {
        console.log("Updating user data:", data); // Debug log

        // Update Profile
        // We must merge with existing userData to avoid sending nulls for required fields (like name/age)
        if (data.fullName || data.age || data.gender || data.weight || data.height || userData) {
            console.log("Sending profile update...");
            
            const payload = {
                full_name: data.fullName || data.name || userData?.name, 
                age: data.age || userData?.age,
                gender: data.gender || userData?.gender,
                current_weight_kg: data.weight || userData?.weight,
                height_cm: data.height || userData?.height,
                // Map activity level to fitness level (approximate) or default to intermediate
                fitness_level: ['sedentary', 'lightly_active'].includes(data.activityLevel || userData?.activityLevel) ? 'beginner' : 
                               ['very_active', 'extremely_active'].includes(data.activityLevel || userData?.activityLevel) ? 'advanced' : 'intermediate'
            };

            await retryRequest(() => axiosInstance.post('/user/profile', payload));
            console.log("Profile updated successfully");
        }

        // Update Goals if present
        // Note: The backend expects 'goal_type', 'target_weight_kg', 'activity_level', 'target_physique'
        if (data.goal || data.activityLevel) {
             console.log("Sending goals update...");
             await retryRequest(() => axiosInstance.post('/user/goals', { 
                goal_type: data.goal === 'lose' ? 'weight_loss' : data.goal === 'gain' ? 'muscle_gain' : 'maintenance', // Map frontend values to backend ENUM
                target_physique: 'athletic', // Default or add to frontend
                target_weight_kg: data.weight || userData?.weight, // Default to current weight if not specified
                activity_level: data.activityLevel || userData?.activityLevel
            }));
            console.log("Goals updated successfully (and triggered AI calculation)");
        }
        return true;

    } catch (err) {
        console.error('Error updating profile/goals:', err);
        console.error('Response data:', err.response?.data);
        alert("Failed to save profile: " + (err.response?.data?.message || err.message));
        return false;
    }
  };



  const completeOnboarding = async (data) => {
      const success = await updateUser(data);
      if (success) {
          await fetchUserData(); // Refresh data to get AI targets
      }
      return success;
  };

  return (
    <UserContext.Provider value={{ userData, updateUser, completeOnboarding, loading }}>
      {children}
    </UserContext.Provider>
  );
};
