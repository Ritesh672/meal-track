import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { useMeals } from '../../context/MealsContext';
import axiosInstance from '../../config/axiosInstance';

const AddMealModal = ({ isOpen, onClose }) => {
  const { addMeal } = useMeals();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyze = async () => {
      if (!formData.description && !formData.name) return;
      
      setIsAnalyzing(true);
      try {
          const textToAnalyze = formData.description || formData.name;
          const res = await axiosInstance.post('/meals/analyze', {
              description: textToAnalyze
          });
          
          const data = res.data;
          
          setFormData(prev => ({
              ...prev,
              name: data.meal_name || prev.name,
              calories: data.calories || prev.calories,
              protein: data.protein_g || prev.protein,
              carbs: data.carbs_g || prev.carbs,
              fat: data.fats_g || prev.fat
          }));
      } catch (err) {
          console.error("Analysis failed", err);
          alert(err.response?.data?.message || err.message || "Failed to analyze meal. Please try again.");
      } finally {
          setIsAnalyzing(false);
      }
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
        description: '',
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
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Add Meal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* AI Analysis Section */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <label className="block text-blue-800 text-sm mb-1 font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    AI Auto-Fill
                </label>
                <p className="text-xs text-blue-600 mb-3">Describe your meal and let AI calculate the nutrition.</p>
                <div className="flex gap-2">
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange}
                        placeholder="e.g. 2 slices of pepperoni pizza and a coke"
                        className="w-full bg-white border border-blue-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-sm resize-none h-20"
                    />
                </div>
                 <button 
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!formData.description && !formData.name)}
                    className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 rounded-lg transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            Analyze Meal
                        </>
                    )}
                </button>
            </div>

            <div className="border-t border-gray-100 my-4 pt-2"></div>

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
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all mt-4 shadow-lg shadow-gray-500/20"
            >
                Saved Meal
            </button>
        </form>
      </div>
    </div>
  );
};

export default AddMealModal;
