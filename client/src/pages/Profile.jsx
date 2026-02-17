import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, ChevronLeft, Save } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();
    const { userData, updateUser } = useUser();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    
    // Local state for editing to avoid constant context updates
    const [editData, setEditData] = useState({
        weight: userData?.weight || '',
        height: userData?.height || '',
        goal: userData?.goal || 'maintain',
        activityLevel: userData?.activityLevel || 'moderate',
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSave = () => {
        updateUser({
            weight: Number(editData.weight),
            height: Number(editData.height),
            goal: editData.goal,
            activityLevel: editData.activityLevel
        });
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6 pb-24">
             <header className="flex items-center gap-4 mb-8">
                <Link to="/" className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold">Your Profile</h1>
            </header>

            <div className="max-w-2xl mx-auto space-y-6">
                {/* User Info Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center gap-4 shadow-sm">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                        <p className="text-gray-500">{user?.email}</p>
                    </div>
                </div>

                {/* Stats & Goals */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Body Metrics & Goals</h3>
                        <button 
                            onClick={isEditing ? handleSave : () => setIsEditing(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                                isEditing 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                        >
                            {isEditing ? <><Save className="w-4 h-4" /> Save Changes</> : 'Edit Details'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-gray-500 text-sm mb-1">Current Weight (kg)</label>
                            {isEditing ? (
                                <input 
                                    type="number" name="weight" value={editData.weight} onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                                />
                            ) : (
                                <p className="text-xl font-semibold text-gray-900">{userData?.weight} kg</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-gray-500 text-sm mb-1">Height (cm)</label>
                             {isEditing ? (
                                <input 
                                    type="number" name="height" value={editData.height} onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                                />
                            ) : (
                                <p className="text-xl font-semibold text-gray-900">{userData?.height} cm</p>
                            )}
                        </div>
                         <div>
                            <label className="block text-gray-500 text-sm mb-1">Activity Level</label>
                             {isEditing ? (
                                 <select 
                                    name="activityLevel" value={editData.activityLevel} onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none capitalize"
                                >
                                    <option value="sedentary">Sedentary</option>
                                    <option value="lightly_active">Lightly Active</option>
                                    <option value="moderately_active">Moderately Active</option>
                                    <option value="very_active">Very Active</option>
                                    <option value="extremely_active">Extremely Active</option>
                                </select>
                            ) : (
                                <p className="text-xl font-semibold capitalize text-gray-900">{userData?.activityLevel}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-gray-500 text-sm mb-1">Goal</label>
                             {isEditing ? (
                                 <select 
                                    name="goal" value={editData.goal} onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none capitalize"
                                >
                                    <option value="lose">Weight Loss</option>
                                    <option value="maintain">Maintain Weight</option>
                                    <option value="gain">Muscle Gain</option>
                                </select>
                            ) : (
                                <p className="text-xl font-semibold capitalize text-gray-900">{userData?.goal === 'lose' ? 'Weight Loss' : userData?.goal === 'maintain' ? 'Maintain Weight' : 'Muscle Gain'}</p>
                            )}
                        </div>
                        <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-100">
                             <label className="block text-gray-500 text-sm mb-1">Daily Calorie Target</label>
                             <p className="text-3xl font-bold text-green-600">{userData?.calorieTarget} <span className="text-base font-normal text-gray-400">kcal/day</span></p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" /> Log Out
                </button>
            </div>
        </div>
    );
};

export default Profile;
