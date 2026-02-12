import React from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { useMeals } from '../../context/MealsContext';

const MealCard = ({ meal }) => {
  const { deleteMeal } = useMeals();

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center hover:bg-gray-50 transition-colors shadow-sm">
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{meal.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{meal.type}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 md:gap-4 mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> {meal.calories || 0} kcal</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> {meal.protein || 0}g P</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> {meal.carbs || 0}g C</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> {meal.fat || 0}g F</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => deleteMeal(meal.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MealCard;
