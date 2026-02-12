import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../config/api';
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
          const token = localStorage.getItem('token');
          const today = new Date().toISOString().split('T')[0];
          const res = await fetch(`${API_URL}/meals?date=${today}`, {
             headers: {
              'x-auth-token': token
            }
          });
          if (res.ok) {
            const data = await res.json();
            // Backend returns flat structure with joined nutrition
            // Frontend expects specific structure, let's map it if needed or adapt frontend
            // Current backend: { id, meal_name, calories, protein_g ... }
            // Current frontend expects: { id, name, calories, protein, carbs, fat ... }
            
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
          }
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
        calories: acc.calories + Number(meal.calories),
        protein: acc.protein + Number(meal.protein),
        carbs: acc.carbs + Number(meal.carbs),
        fat: acc.fat + Number(meal.fat),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    setTotals(newTotals);
  }, [meals]);

  const addMeal = async (meal) => {
    // Optimistic Update
    const tempId = Date.now();
    const newMealFrontend = { ...meal, id: tempId };
    setMeals(prev => [...prev, newMealFrontend]);

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/meals`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                meal_type: meal.type,
                meal_name: meal.name,
                description: '',
                input_type: 'text',
                image_url: meal.image,
                calories: meal.calories,
                protein_g: meal.protein,
                carbs_g: meal.carbs,
                fats_g: meal.fat
            })
        });

        if (res.ok) {
            const savedMeal = await res.json();
            // Replace temp ID with real ID
            setMeals(prev => prev.map(m => m.id === tempId ? {
                ...m,
                id: savedMeal.id
            } : m));
        }
    } catch (err) {
        console.error('Error adding meal', err);
        // Rollback?
        setMeals(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const deleteMeal = async (id) => {
    setMeals(prev => prev.filter(meal => meal.id !== id));
    try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/meals/${id}`, {
            method: 'DELETE',
            headers: { 
                'x-auth-token': token
            }
        });
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
