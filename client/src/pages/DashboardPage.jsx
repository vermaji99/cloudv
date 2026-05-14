import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { metadataService } from '../services/api';
import {
    LogOut,
    RefreshCw,
    Database,
    User,
    Building2,
    CheckCircle2,
    XCircle,
    Search,
    Globe,
    Save,
    CheckSquare,
    Square,
    Menu,
    X,
    ChevronDown,
    AlertTriangle,
    Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const [rules, setRules] = useState([]);
    const [initialRules, setInitialRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('validation');

    const fetchRules = async () => {
        setLoading(true);
        try {
            const response = await metadataService.getValidationRules();
            if (response.success) {
                setRules(response.data);
                setInitialRules(JSON.parse(JSON.stringify(response.data)));
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch validation rules';
            toast.error(message);
            
            // If session expired, redirect to login
            if (error.response?.status === 401) {
                setTimeout(() => {
                    logout();
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (id) => {
        setRules(rules.map(rule =>
            rule.Id === id ? { ...rule, Active: !rule.Active } : rule
        ));
    };

    const handleEnableAll = () => {
        setRules(rules.map(rule => ({ ...rule, Active: true })));
    };

    const handleDisableAll = () => {
        setRules(rules.map(rule => ({ ...rule, Active: false })));
    };

    const handleRollback = () => {
        setRules(JSON.parse(JSON.stringify(initialRules)));
        toast.success('Changes rolled back');
    };

    const hasChanges = JSON.stringify(rules) !== JSON.stringify(initialRules);

    const handleDeploy = async () => {
        setUpdating(true);
        const toastId = toast.loading('Deploying changes to Salesforce...');

        try {
            const updates = rules
                .filter(rule => {
                    const original = initialRules.find(r => r.Id === rule.Id);
                    return original && original.Active !== rule.Active;
                })
                .map(rule => ({ Id: rule.Id, Active: rule.Active }));

            if (updates.length === 0) {
                toast.dismiss(toastId);
                toast.success('No changes to deploy');
                setUpdating(false);
                return;
            }

            const response = await metadataService.bulkUpdateValidationRules(updates);
            if (response.success) {
                toast.success(response.message, { id: toastId });
                setInitialRules(JSON.parse(JSON.stringify(rules)));
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Deployment failed';
            toast.error(message, { id: toastId });

            if (error.response?.status === 401) {
                setTimeout(() => {
                    logout();
                }, 2000);
            }
        } finally {
            setUpdating(false);
        }
    };

    const filteredRules = rules.filter(rule =>
        rule.ValidationName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tabs = [
        { id: 'validation', label: 'Validation Rules' },
        { id: 'workflows', label: 'Workflows', disabled: true },
        { id: 'flows', label: 'Process Flows', disabled: true },
        { id: 'triggers', label: 'Triggers', disabled: true },
    ];

    return (
        <div className="min-h-screen bg-brand-50 flex flex-col">
            <header className="bg-[#011627] text-white shadow-xl border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 sm:h-20 items-center">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="p-2 sm:p-2.5 bg-sky-500 rounded-xl shadow-lg shadow-sky-500/20">
                                <Database className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight">
                                    CloudV
                                </h1>
                                <p className="text-[10px] sm:text-[11px] font-bold text-sky-400 uppercase tracking-widest">
                                    Metadata Manager
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <p className="text-sm font-bold text-white">{user?.username?.split('@')[0] || 'User'}</p>
                                <p className="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">{user?.orgName || 'Production Org'}</p>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 sm:p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mb-6 sm:mb-8">
                    <div className="p-6 sm:p-8 lg:p-10">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
                                    Salesforce Switch
                                </h2>
                                <p className="text-slate-500 text-sm sm:text-base max-w-2xl font-medium">
                                    Easily enable and disable validation rules in your Salesforce org. Perfect for data migrations and testing.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <button
                                    onClick={fetchRules}
                                    disabled={loading}
                                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 text-sm font-bold text-white bg-[#00a1e0] rounded-xl hover:bg-[#008cc2] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center border border-blue-400/30"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            <span className="whitespace-nowrap">Fetching...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Database className="w-4 h-4 mr-2 text-blue-100" />
                                            <span className="whitespace-nowrap">Get Metadata</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-5 sm:p-6 lg:p-8 bg-slate-50 rounded-2xl border border-slate-200">
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Username</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 break-all leading-relaxed">{user?.username || '-'}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Organisation</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed truncate">{user?.orgName || '-'}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Appliance</p>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 font-mono break-all leading-relaxed">{user?.instanceUrl || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {rules.length > 0 && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex border-b sm:border-b-0 sm:space-x-1 bg-slate-100 sm:bg-transparent p-1 rounded-xl sm:rounded-none overflow-x-auto scrollbar-none">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => !tab.disabled && setActiveTab(tab.id)}
                                        disabled={tab.disabled}
                                        className={`
                                            px-6 py-2.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all uppercase tracking-wider
                                            ${activeTab === tab.id
                                                ? 'bg-blue-700 text-white shadow-md border border-blue-800'
                                                : tab.disabled
                                                    ? 'text-slate-400 cursor-not-allowed'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                            }
                                        `}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {hasChanges && (
                                <div className="flex items-center text-xs text-blue-700 font-black uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                                    {rules.filter(r => {
                                        const orig = initialRules.find(x => x.Id === r.Id);
                                        return orig && orig.Active !== r.Active;
                                    }).length} Unsaved Changes
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                            <div className="p-5 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
                                <div className="flex items-center space-x-3">
                                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Account Validation Rules</h3>
                                    <span className="px-2.5 py-0.5 bg-sky-600 text-white text-[10px] font-black rounded-full shadow-sm">
                                        {filteredRules.length}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={handleEnableAll}
                                        className="px-4 py-2 text-[10px] font-black text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all uppercase tracking-widest shadow-lg shadow-emerald-600/20 border border-emerald-500"
                                    >
                                        Enable All
                                    </button>
                                    <button
                                        onClick={handleDisableAll}
                                        className="px-4 py-2 text-[10px] font-black text-white bg-slate-600 rounded-lg hover:bg-slate-700 transition-all uppercase tracking-widest shadow-lg shadow-slate-600/20 border border-slate-500"
                                    >
                                        Disable All
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 sm:p-8">
                                <div className="relative mb-8">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search validation rules..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 bg-slate-50/30 text-sm font-medium text-slate-900 placeholder:text-slate-300 transition-all"
                                    />
                                </div>

                                <div className="space-y-4">
                                    {loading && rules.length === 0 ? (
                                        <div className="text-center py-16">
                                            <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 text-sky-500" />
                                            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Fetching Rules...</p>
                                        </div>
                                    ) : filteredRules.length === 0 ? (
                                        <div className="text-center py-16 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                                            <Database className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                                            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No Rules Found</p>
                                        </div>
                                    ) : (
                                        filteredRules.map((rule) => {
                                            const originalRule = initialRules.find(r => r.Id === rule.Id);
                                            const isModified = originalRule && originalRule.Active !== rule.Active;

                                            return (
                                                <div
                                                    key={rule.Id}
                                                    className={`group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                                                        isModified
                                                            ? 'bg-sky-50/30 border-sky-200 shadow-sm'
                                                            : 'bg-white border-slate-50 hover:border-slate-100 hover:shadow-md hover:shadow-slate-900/5'
                                                    }`}
                                                >
                                                    <div className="flex-1 min-w-0 mb-4 sm:mb-0 pr-4">
                                                        <div className="flex items-center space-x-3">
                                                            <span className={`text-sm font-black ${isModified ? 'text-sky-600' : 'text-slate-900'}`}>
                                                                {rule.ValidationName}
                                                            </span>
                                                            {isModified && (
                                                                <span className="px-2 py-0.5 bg-sky-600 text-white text-[9px] font-black uppercase rounded tracking-widest shadow-sm">
                                                                    Modified
                                                                </span>
                                                            )}
                                                        </div>
                                                        {rule.ErrorMessage && (
                                                            <p className="text-[11px] text-slate-500 mt-1.5 font-medium italic truncate max-w-lg">
                                                                "{rule.ErrorMessage}"
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between sm:justify-end space-x-6">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                            rule.Active ? 'text-emerald-600' : 'text-slate-400'
                                                        }`}>
                                                            {rule.Active ? 'Active' : 'Inactive'}
                                                        </span>
                                                        <button
                                                            onClick={() => handleToggle(rule.Id)}
                                                            className={`
                                                                relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-sky-500/20
                                                                ${rule.Active ? 'bg-sky-500' : 'bg-slate-300'}
                                                            `}
                                                        >
                                                            <span
                                                                className={`
                                                                    inline-block h-5 w-5 transform rounded-full bg-white transition-all shadow-md
                                                                    ${rule.Active ? 'translate-x-6' : 'translate-x-1'}
                                                                `}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
                            <button
                                onClick={handleRollback}
                                disabled={!hasChanges}
                                className={`
                                    px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center border-2
                                    ${hasChanges
                                        ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm'
                                        : 'bg-slate-50 text-slate-300 border-transparent cursor-not-allowed'
                                    }
                                `}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Reset Changes
                            </button>
                            <button
                                onClick={handleDeploy}
                                disabled={updating || !hasChanges}
                                className={`
                                    px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center shadow-xl border-2
                                    ${hasChanges
                                        ? 'bg-[#00a1e0] text-white border-blue-400 hover:bg-[#008cc2] shadow-blue-500/30'
                                        : 'bg-slate-100 text-slate-300 border-transparent cursor-not-allowed'
                                    }
                                `}
                            >
                                {updating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Deploying...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Confirm & Deploy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <footer className="bg-white border-t border-slate-100 py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest gap-4">
                        <p className="flex items-center">
                            <Globe className="w-3 h-3 mr-2 text-sky-500" />
                            Node: <span className="text-slate-900 ml-1">{user?.instanceUrl}</span>
                        </p>
                        <p className="flex items-center">
                            <Database className="w-3 h-3 mr-2 text-sky-500" />
                            Target: <span className="text-slate-900 ml-1">Account Object</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DashboardPage;
