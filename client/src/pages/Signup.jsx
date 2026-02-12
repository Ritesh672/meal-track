import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Loader2 } from 'lucide-react';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setError('');
        setLoading(true);
        try {
            await signup(name, email, password);
            navigate('/onboarding');
        } catch (err) {
            setError('Failed to create an account.');
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white text-gray-900">
             {/* Left Side - Form */}
             <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 border-r border-gray-100">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl font-bold tracking-tight text-gray-900">Create Account</h2>
                         <p className="mt-2 text-gray-500">Join us to start your transformation today.</p>
                    </div>

                    {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
                        </button>
                    </form>
                    <p className="text-center text-gray-500 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-green-600 hover:text-green-500 font-semibold hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>

             {/* Right Side - Image */}
            <div className="hidden lg:block relative overflow-hidden bg-gray-100">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <img 
                    src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop" 
                    alt="Fitness Workout" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                 <div className="absolute bottom-0 left-0 right-0 p-12 z-20">
                    <h3 className="text-3xl font-bold text-white mb-2">Build Your Best Self</h3>
                    <p className="text-gray-100 text-lg">Consistency is key. We help you stay on track with every meal.</p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
