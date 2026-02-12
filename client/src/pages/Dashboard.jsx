import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useMeals } from '../context/MealsContext';
import RadialProgress from '../components/dashboard/RadialProgress';
import MealCard from '../components/meals/MealCard';
import AddMealModal from '../components/meals/AddMealModal';
import { Plus, LayoutDashboard, History, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const { userData } = useUser();
    const { meals, totals } = useMeals();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const location = useLocation();

    const targets = useMemo(() => {
        const calories = userData?.calorieTarget || 2000;
        // Standard split: 30% Protein, 40% Carbs, 30% Fat or similar for "average" diet
        // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
        return {
            calories: calories,
            protein: (calories * 0.25) / 4,
            carbs: (calories * 0.45) / 4,
            fat: (calories * 0.30) / 9,
        };
    }, [userData]);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6">
                <h1 className="text-2xl font-bold tracking-tight text-blue-600 mb-10">NutriTrack</h1>
                <nav className="flex-1 space-y-4">
                     <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </Link>
                    <Link to="/history" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/history' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <History className="w-5 h-5" /> History
                    </Link>
                    <Link to="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === '/profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <User className="w-5 h-5" /> Profile
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                <div className="p-4 md:p-10 max-w-7xl mx-auto pb-28 md:pb-10">
                    <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 md:mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Good Morning, {user?.name} 👋</h2>
                            <p className="text-gray-500 mt-1 text-sm md:text-base">{today}</p>
                        </div>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 md:py-2 rounded-xl md:rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                        >
                            <Plus className="w-5 h-5" /> Add Meal
                        </button>
                    </header>

                    {/* Nutrition Overview */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
                        <RadialProgress 
                            value={totals.calories} 
                            maxValue={targets.calories} 
                            label="Calories" 
                            unit="kcal" 
                            color="#3b82f6" 
                        />
                        <RadialProgress 
                            value={totals.protein} 
                            maxValue={targets.protein} 
                            label="Protein" 
                            unit="grams" 
                            color="#ef4444" 
                        />
                        <RadialProgress 
                            value={totals.carbs} 
                            maxValue={targets.carbs} 
                            label="Carbs" 
                            unit="grams" 
                            color="#eab308" 
                        />
                         <RadialProgress 
                            value={totals.fat} 
                            maxValue={targets.fat} 
                            label="Fats" 
                            unit="grams" 
                            color="#a855f7" 
                        />
                    </div>

                    {/* Today's Meals */}
                    <section>
                        <h3 className="text-xl font-bold mb-4 text-gray-900">Today's Meals</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {meals.length > 0 ? (
                                meals.slice().reverse().map(meal => (
                                    <MealCard key={meal.id} meal={meal} />
                                ))
                            ) : (
                                <div className="col-span-full border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-gray-500 bg-white/50">
                                    <p className="text-lg font-medium">No meals logged today</p>
                                    <p className="text-sm">Start tracking your nutrition by adding a meal.</p>
                                    <button onClick={() => setIsAddModalOpen(true)} className="mt-4 text-blue-600 hover:underline">Add your first meal</button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Mobile Bottom Nav */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-around items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <LayoutDashboard className="w-6 h-6" />
                        <span className="text-xs font-medium">Dashboard</span>
                    </Link>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 text-white p-3 rounded-full -mt-8 shadow-lg shadow-blue-500/30 border-4 border-gray-50"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                    <Link to="/history" className={`flex flex-col items-center gap-1 ${location.pathname === '/history' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <History className="w-6 h-6" />
                        <span className="text-xs font-medium">History</span>
                    </Link>
                    <Link to="/profile" className={`flex flex-col items-center gap-1 ${location.pathname === '/profile' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <User className="w-6 h-6" />
                        <span className="text-xs font-medium">Profile</span>
                    </Link>
                </nav>

                <AddMealModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            </main>
        </div>
    );
};

export default Dashboard;
