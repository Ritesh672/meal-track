import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const { completeOnboarding } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    bodyType: 'average',
    activityLevel: 'moderately_active',
    goal: 'maintain',
    dietPreference: 'non-veg',
    allergies: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleFinish = async () => {
    setIsGenerating(true);
    const success = await completeOnboarding(formData);
    if (success) {
      navigate('/');
    } else {
        setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100 w-full">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-8">
             {/* Step 1: Personal Info */}
            {step === 1 && (
                <div className="animate-fade-in">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Tell us about yourself</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-600 mb-1 font-medium">Full Name <span className="text-red-500">*</span></label>
                            <input 
                                type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-gray-900"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-600 mb-1 font-medium">Age <span className="text-red-500">*</span></label>
                                <input 
                                    type="number" name="age" value={formData.age} onChange={handleChange}
                                    placeholder="25"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 mb-1 font-medium">Gender</label>
                                <select 
                                    name="gender" value={formData.gender} onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-gray-900"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Body Metrics */}
            {step === 2 && (
                <div className="animate-fade-in">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Your Body Metrics</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-600 mb-1 font-medium">Height (cm)</label>
                                <input 
                                    type="number" step="0.1" name="height" value={formData.height} onChange={handleChange}
                                    placeholder="175.5"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-600 mb-1 font-medium">Weight (kg)</label>
                                <input 
                                    type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange}
                                    placeholder="70.2"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-gray-900"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1 font-medium">Activity Level</label>
                            <select 
                                name="activityLevel" value={formData.activityLevel} onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-gray-900"
                            >
                                <option value="sedentary">Sedentary (Little/no exercise)</option>
                                <option value="lightly_active">Lightly Active (Light exercise 1-3 days/week)</option>
                                <option value="moderately_active">Moderately Active (Moderate exercise 3-5 days/week)</option>
                                <option value="very_active">Very Active (Hard exercise 6-7 days/week)</option>
                                <option value="extremely_active">Extremely Active (Very hard exercise & physical job)</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
            

            {/* Step 3: Goals */}
            {step === 3 && (
                 <div className="animate-fade-in">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">What's your goal?</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {['lose', 'maintain', 'gain'].map((goal) => (
                            <button
                                key={goal}
                                onClick={() => setFormData(prev => ({ ...prev, goal }))}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    formData.goal === goal 
                                    ? 'border-blue-600 bg-blue-50 text-blue-800' 
                                    : 'border-gray-200 hover:border-blue-300 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <div className="font-semibold text-lg capitalize">{goal === 'loss' ? 'Weight Loss' : goal === 'gain' ? 'Muscle Gain' : 'Maintain Weight'}</div>
                                <div className="text-sm opacity-80">
                                    {goal === 'lose' && 'Deficit ~500 cal/day'}
                                    {goal === 'maintain' && 'Balanced intake'}
                                    {goal === 'gain' && 'Surplus ~500 cal/day'}
                                </div>
                            </button>
                        ))}
                    </div>
                 </div>
            )}

             {/* Step 4: Preferences */}
             {step === 4 && (
                <div className="animate-fade-in">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Dietary Preferences</h2>
                    <div className="space-y-4">
                         <div>
                            <label className="block text-gray-600 mb-2 font-medium">Diet Type</label>
                            <div className="flex gap-4">
                                {['veg', 'non-veg', 'vegan'].map((type) => (
                                     <button
                                        key={type}
                                        onClick={() => setFormData(prev => ({ ...prev, dietPreference: type }))}
                                        className={`px-4 py-2 rounded-lg capitalize border font-medium transition-colors ${
                                            formData.dietPreference === type
                                            ? 'bg-green-600 border-green-600 text-white'
                                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {type}
                                     </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1 font-medium">Allergies (Optional)</label>
                            <input 
                                type="text" name="allergies" value={formData.allergies} onChange={handleChange}
                                placeholder="e.g. Peanuts, Gluten"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-gray-900"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
                {step > 1 ? (
                    <button 
                        onClick={handleBack}
                        className="px-6 py-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                ) : <div></div>}
                
                {step < 4 ? (
                    <button 
                        onClick={handleNext}
                        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button 
                        onClick={handleFinish}
                        disabled={isGenerating}
                        className={`px-8 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg ${
                            isGenerating 
                            ? 'bg-gray-400 cursor-not-allowed text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20'
                        }`}
                    >
                        {isGenerating ? 'Generating Plan...' : 'Finish Setup'} <Check className={`w-4 h-4 ${isGenerating ? 'hidden' : ''}`} />
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
