import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Calendar } from 'lucide-react';

import axiosInstance from '../config/axiosInstance';

const History = () => {
    const [historyGroups, setHistoryGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch all meals
                const res = await axiosInstance.get('/meals?all=true');
                
                const meals = res.data;
                
                // Group by date
                const groupsObj = meals.reduce((acc, meal) => {
                    // date comes as full ISO string from PG maybe? or just YYYY-MM-DD
                    // pg 'date' type returns string YYYY-MM-DD mostly or timestamp
                    const dateKey = meal.meal_date.split('T')[0];
                    
                    if (!acc[dateKey]) {
                        acc[dateKey] = {
                            date: dateKey,
                            meals: [],
                            totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
                        };
                    }
                    
                    /* map backend fields to frontend */
                    const frontendMeal = {
                            id: meal.id,
                            name: meal.meal_name,
                            type: meal.meal_type,
                            calories: Number(meal.calories), // ensure number
                            protein: Number(meal.protein_g),
                            carbs: Number(meal.carbs_g),
                            fat: Number(meal.fats_g)
                    };

                    acc[dateKey].meals.push(frontendMeal);
                    acc[dateKey].totals.calories += frontendMeal.calories;
                    acc[dateKey].totals.protein += frontendMeal.protein;
                    acc[dateKey].totals.carbs += frontendMeal.carbs;
                    acc[dateKey].totals.fat += frontendMeal.fat;
                    
                    return acc;
                }, {});

                // Convert to array and sort
                const groups = Object.values(groupsObj).sort((a, b) => new Date(b.date) - new Date(a.date));
                setHistoryGroups(groups);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6 pb-24">
             <header className="flex items-center gap-4 mb-8">
                <Link to="/" className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Meal History</h1>
            </header>

            <div className="max-w-3xl mx-auto space-y-6">
                {historyGroups.length > 0 ? (
                    historyGroups.map((group) => (
                        <div key={group.date} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-semibold text-gray-900">{formatDate(group.date)}</h3>
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    Total: <span className="text-gray-900 font-bold">{group.totals.calories}</span> kcal
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between text-xs text-gray-500 mb-4 px-2">
                                    <span>Protein: {group.totals.protein}g</span>
                                    <span>Carbs: {group.totals.carbs}g</span>
                                    <span>Fat: {group.totals.fat}g</span>
                                </div>
                                <div className="space-y-2">
                                    {group.meals.map((meal) => (
                                        <div key={meal.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                            <div>
                                                <p className="font-medium text-gray-900">{meal.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{meal.type}</p>
                                            </div>
                                            <span className="font-bold text-gray-700">{meal.calories} kcal</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-300" />
                        <p>No history found.</p>
                        <p className="text-sm">Measurements will appear here once you log meals.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
