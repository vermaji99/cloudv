import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Cloud, ShieldCheck, Zap, AlertCircle, ChevronRight, CheckCircle } from 'lucide-react';

const LoginPage = () => {
    const { login } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const error = queryParams.get('error');
    const errorMsg = queryParams.get('msg');

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-[#011627]">
            <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-[#011627] via-[#012a4a] to-[#011627] relative overflow-hidden border-r border-white/5">
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#grid)" />
                    </svg>
                </div>
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-24 text-white">
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
                                <Cloud className="w-10 h-10 text-sky-400" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white">CloudV Metadata</span>
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4 text-white">
                            Manage Salesforce<br />
                            <span className="text-sky-400">Like a Pro</span>
                        </h1>
                        <p className="text-lg text-slate-300 max-w-md leading-relaxed">
                            Take control of your org's validation rules with a powerful, intuitive interface. Enable, disable, and deploy changes in seconds.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { icon: ShieldCheck, title: 'Secure OAuth 2.0', desc: 'Enterprise-grade security with Salesforce', color: 'text-sky-400' },
                            { icon: Zap, title: 'Instant Updates', desc: 'Real-time metadata management', color: 'text-amber-400' },
                            { icon: CheckCircle, title: 'Bulk Operations', desc: 'Enable or disable rules in batch', color: 'text-emerald-400' },
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                                <feature.icon className={`w-6 h-6 ${feature.color} flex-shrink-0`} />
                                <div>
                                    <p className="font-bold text-white">{feature.title}</p>
                                    <p className="text-sm text-slate-400">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-slate-50">
                <div className="w-full max-w-md">
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#011627] rounded-2xl mb-4 shadow-xl border border-white/10">
                            <Cloud className="w-8 h-8 text-sky-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">CloudV Metadata</h1>
                    </div>

                    <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-200">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-slate-500 font-medium">
                                Connect to your Salesforce org to continue
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-red-900">Authentication Failed</p>
                                        <p className="text-xs text-red-700 mt-1 font-medium">
                                            {errorMsg || 'Unable to connect to Salesforce. Please try again.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={login}
                            className="w-full group flex items-center justify-center space-x-3 px-4 sm:px-6 py-4 bg-[#00a1e0] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:bg-[#008cc2] active:scale-[0.98] transition-all duration-200"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                            </svg>
                            <span className="text-base sm:text-lg whitespace-nowrap">Connect with Salesforce</span>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                        </button>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <p className="text-[11px] text-center text-brand-400 font-medium leading-relaxed">
                                By connecting, you agree to our Terms of Service and Privacy Policy.
                                Your credentials are never stored on our servers.
                            </p>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-sm text-brand-500 font-medium">
                        Need help?{' '}
                        <a href="#" className="text-accent-600 hover:text-accent-700 font-bold underline decoration-accent-600/30 underline-offset-4 transition-all">
                            View Documentation
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
