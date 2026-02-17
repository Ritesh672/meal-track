import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../config/axiosInstance';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
            // Fallback to manual if needed (logic removed as requested)
          });
        } catch (err) {
          console.error('Error fetching user data', err);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  const updateUser = async (data) => {
    // Optimistic update
    setUserData(prev => ({ 
        ...prev, 
        ...data,
        name: data.fullName || data.name || prev?.name 
    }));

    try {
        console.log("Updating user data:", data); // Debug log

        // Update Profile
        if (data.fullName || data.age || data.gender || data.weight || data.height) {
            console.log("Sending profile update...");
            await axiosInstance.post('/user/profile', { 
                full_name: data.fullName || data.name, 
                age: data.age,
                gender: data.gender,
                current_weight_kg: data.weight,
                height_cm: data.height,
                // Map activity level to fitness level (approximate) or default to intermediate
                fitness_level: ['sedentary', 'lightly_active'].includes(data.activityLevel) ? 'beginner' : 
                               ['very_active', 'extremely_active'].includes(data.activityLevel) ? 'advanced' : 'intermediate'
            });
            console.log("Profile updated successfully");
        }

        // Update Goals if present
        // Note: The backend expects 'goal_type', 'target_weight_kg', 'activity_level', 'target_physique'
        if (data.goal || data.activityLevel) {
             console.log("Sending goals update...");
             await axiosInstance.post('/user/goals', { 
                goal_type: data.goal === 'lose' ? 'weight_loss' : data.goal === 'gain' ? 'muscle_gain' : 'maintenance', // Map frontend values to backend ENUM
                target_physique: 'athletic', // Default or add to frontend
                target_weight_kg: data.weight, // Default to current weight if not specified
                activity_level: data.activityLevel
            });
            console.log("Goals updated successfully (and triggered AI calculation)");
        }

    } catch (err) {
        console.error('Error updating profile/goals:', err);
        console.error('Response data:', err.response?.data);
        alert("Failed to save profile: " + (err.response?.data?.message || err.message));
    }
  };



  const completeOnboarding = async (data) => {
      await updateUser(data);
  };

  return (
    <UserContext.Provider value={{ userData, updateUser, completeOnboarding, loading }}>
      {children}
    </UserContext.Provider>
  );
};
