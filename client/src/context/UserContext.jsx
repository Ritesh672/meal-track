import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../config/api';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_URL}/user/profile`, {
            headers: {
              'x-auth-token': token
            }
          });
          if (res.ok) {
            const data = await res.json();
            // Map backend data to frontend structure
            setUserData({
              name: data.profile?.full_name || user.email,
              age: data.profile?.age,
              gender: data.profile?.gender,
              weight: data.profile?.current_weight_kg,
              height: data.profile?.height_cm,
              activityLevel: data.goals?.activity_level,
              goal: data.goals?.goal_type,
              onboarded: !!data.profile?.age, // Simple check if onboarding is done
              calorieTarget: calculateDailyCalories({
                  weight: data.profile?.current_weight_kg,
                  height: data.profile?.height_cm,
                  age: data.profile?.age,
                  gender: data.profile?.gender,
                  activityLevel: data.goals?.activity_level,
                  goal: data.goals?.goal_type
              })
            });
          }
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
        const token = localStorage.getItem('token');
        
        // Update Profile
        if (data.name || data.fullName || data.age || data.gender || data.weight || data.height) {
            await fetch(`${API_URL}/user/profile`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'x-auth-token': token
                },
                body: JSON.stringify({ 
                    full_name: data.fullName || data.name, // Handle both potential sources
                    age: data.age,
                    gender: data.gender,
                    current_weight_kg: data.weight,
                    height_cm: data.height,
                    fitness_level: 'intermediate' // default for now
                })
            });
        }

        // Update Goals if present
        if (data.goal || data.activityLevel) {
             await fetch(`${API_URL}/user/goals`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'x-auth-token': token
                },
                body: JSON.stringify({ 
                    goal_type: data.goal,
                    target_physique: 'athletic', // default
                    target_weight_kg: data.weight, // placeholder
                    activity_level: data.activityLevel
                })
            });
        }

    } catch (err) {
        console.error('Error updating profile', err);
        // revert?
    }
  };

  const calculateDailyCalories = (data) => {
      if (!data.weight || !data.height || !data.age || !data.gender || !data.activityLevel || !data.goal) return 2000;

      // Harris-Benedict Equation
      let bmr;
      if (data.gender === 'male') {
          bmr = 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age);
      } else {
          bmr = 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
      }

      let activityMultiplier;
      switch (data.activityLevel) {
          case 'sedentary': activityMultiplier = 1.2; break;
          case 'moderate': activityMultiplier = 1.55; break;
          case 'active': activityMultiplier = 1.725; break;
          default: activityMultiplier = 1.2;
      }

      let maintenanceCalories = bmr * activityMultiplier;
      
      let targetCalories = maintenanceCalories;
      if (data.goal === 'lose') targetCalories -= 500; // 'weight_loss' map check needed
      else if (data.goal === 'gain') targetCalories += 500; // 'muscle_gain' map check

      return Math.round(targetCalories);
  };

  const completeOnboarding = (data) => {
      // Logic handled in updateUser now which saves to DB
      updateUser({ ...data, onboarded: true });
  };

  return (
    <UserContext.Provider value={{ userData, updateUser, completeOnboarding, loading }}>
      {children}
    </UserContext.Provider>
  );
};
