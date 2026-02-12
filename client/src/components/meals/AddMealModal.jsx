import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useMeals } from '../../context/MealsContext';

const AddMealModal = ({ isOpen, onClose }) => {
  const { addMeal } = useMeals();
  const [formData, setFormData] = useState({
    name: '',
    type: 'breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.calories) return;
    
    addMeal({
        ...formData,
        calories: Number(formData.calories),
        protein: Number(formData.protein) || 0,
        carbs: Number(formData.carbs) || 0,
        fat: Number(formData.fat) || 0
    });
    
    // Reset and close
    setFormData({
        name: '',
        type: 'breakfast',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Add Meal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-gray-600 text-sm mb-1 font-medium">Meal Name</label>
                <input 
                    type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="e.g. Oatmeal & Eggs"
                />
            </div>
            
            <div>
                <label className="block text-gray-600 text-sm mb-1 font-medium">Meal Type</label>
                <select 
                    name="type" value={formData.type} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-600 text-sm mb-1 font-medium">Calories</label>
                    <input 
                        type="number" name="calories" value={formData.calories} onChange={handleChange} required
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                </div>
                 <div>
                    <label className="block text-gray-600 text-sm mb-1 font-medium">Protein (g)</label>
                    <input 
                        type="number" name="protein" value={formData.protein} onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                </div>
                 <div>
                    <label className="block text-gray-600 text-sm mb-1 font-medium">Carbs (g)</label>
                    <input 
                        type="number" name="carbs" value={formData.carbs} onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                </div>
                 <div>
                    <label className="block text-gray-600 text-sm mb-1 font-medium">Fat (g)</label>
                    <input 
                        type="number" name="fat" value={formData.fat} onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                </div>
            </div>

            <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all mt-4 shadow-lg shadow-blue-500/20"
            >
                Add Meal
            </button>
        </form>
      </div>
    </div>
  );
};

export default AddMealModal;
