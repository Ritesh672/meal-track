import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../config/axiosInstance';
import { useAuth } from './AuthContext';

const MealsContext = createContext();

export const useMeals = () => useContext(MealsContext);

export const MealsProvider = ({ children }) => {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  useEffect(() => {
    const fetchMeals = async () => {
      if (user) {
        try {
          const today = new Date().toISOString().split('T')[0];
          const res = await axiosInstance.get(`/meals?date=${today}`);
          
          const data = res.data;
            
          const mappedMeals = data.map(m => ({
              id: m.id,
              name: m.meal_name,
              type: m.meal_type,
              time: m.meal_time,
              calories: m.calories,
              protein: m.protein_g,
              carbs: m.carbs_g,
              fat: m.fats_g,
              image: m.image_url
          }));
          setMeals(mappedMeals);
        } catch (err) {
          console.error('Error fetching meals', err);
        }
      } else {
        setMeals([]);
      }
    };
    fetchMeals();
  }, [user]);

  useEffect(() => {
    // Calculate totals from current state
    const newTotals = meals.reduce((acc, meal) => ({
        calories: acc.calories + (Number(meal.calories) || 0),
        protein: acc.protein + (Number(meal.protein) || 0),
        carbs: acc.carbs + (Number(meal.carbs) || 0),
        fat: acc.fat + (Number(meal.fat) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    setTotals(newTotals);
  }, [meals]);

  const addMeal = async (meal) => {
    // Optimistic Update
    const tempId = Date.now();
    const newMealFrontend = { ...meal, id: tempId };
    setMeals(prev => [...prev, newMealFrontend]);

    try {
        const res = await axiosInstance.post('/meals', {
            meal_type: meal.type,
            meal_name: meal.name,
            description: '',
            input_type: 'text',
            image_url: meal.image,
            calories: meal.calories,
            protein_g: meal.protein,
            carbs_g: meal.carbs,
            fats_g: meal.fat
        });

        const savedMeal = res.data;
        // Replace temp ID with real ID
        setMeals(prev => prev.map(m => m.id === tempId ? {
            ...m,
            id: savedMeal.id
        } : m));

    } catch (err) {
        console.error('Error adding meal', err);
        // Rollback?
        setMeals(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const deleteMeal = async (id) => {
    setMeals(prev => prev.filter(meal => meal.id !== id));
    try {
        await axiosInstance.delete(`/meals/${id}`);
    } catch (err) {
        console.error('Error deleting meal', err);
    }
  };
    
  const updateMeal = (id, updatedMeal) => {
      // Not implemented in backend yet, just local state
      setMeals(prev => prev.map(meal => (meal.id === id ? { ...meal, ...updatedMeal } : meal)));
  }

  return (
    <MealsContext.Provider value={{ meals, addMeal, deleteMeal, updateMeal, totals }}>
      {children}
    </MealsContext.Provider>
  );
};
