import React, { useState } from 'react';
import { Scale, Lock, Mail, User, MapPin, Globe, Phone, PhoneCall, MessageSquare, ShieldCheck, CheckCircle2, ChevronDown } from 'lucide-react';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { authService } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('PARALEGAL');
  const [district, setDistrict] = useState('Mandya');
  const [language, setLanguage] = useState('kn');
  const [specialization, setSpecialization] = useState('');

  // Location-based Nyaaya Mitra Directory State
  const [selectedHelpDistrict, setSelectedHelpDistrict] = useState('Mandya');

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const districtDirectory = {
    'Mandya': {
      mitraName: 'Ravi Kumar (Lead Nyaaya Mitra)',
      phone: '+91 94481 77665',
      desk: 'DLSA Front Office, District Court Complex, Mandya',
      landline: '08232-224411',
      whatsapp: '919448177665',
    },
    'Bengaluru Urban': {
      mitraName: 'Nandini Ramesh (Senior Paralegal Coordinator)',
      phone: '+91 98450 12345',
      desk: 'City Civil Court Complex, Bengaluru Urban DLSA',
      landline: '080-22211244',
      whatsapp: '919845012345',
    },
    'Bengaluru Rural': {
      mitraName: 'Girish H. M. (Nyaaya Mitra Coordinator)',
      phone: '+91 97412 34567',
      desk: 'District & Sessions Court, Bengaluru Rural DLSA',
      landline: '080-22998811',
      whatsapp: '919741234567',
    },
    'Mysuru': {
      mitraName: 'Dr. Ramesh Patil (District Triage Paralegal)',
      phone: '+91 94801 88990',
      desk: 'Malalavadi Court Complex, DLSA Mysuru',
      landline: '0821-2412345',
      whatsapp: '919480188990',
    },
    'Tumakuru': {
      mitraName: 'Kavitha S. (Nyaaya Mitra Volunteer)',
      phone: '+91 98860 54321',
      desk: 'District Court Complex, DLSA Tumakuru',
      landline: '0816-2278900',
      whatsapp: '919886054321',
    },
    'Kolar': {
      mitraName: 'Manjunath B. (Field Paralegal)',
      phone: '+91 99001 12233',
      desk: 'DLSA Legal Aid Helpdesk, Court Road, Kolar',
      landline: '08152-223344',
      whatsapp: '919900112233',
    },
    'Belagavi': {
      mitraName: 'Basavaraj K. (Nyaaya Mitra Helpdesk)',
      phone: '+91 94490 66778',
      desk: 'District Court Building, DLSA Belagavi',
      landline: '0831-2423311',
      whatsapp: '919449066778',
    },
    'Kalaburagi': {
      mitraName: 'Mallikarjun S. (Legal Aid Officer)',
      phone: '+91 94480 33445',
      desk: 'Main Court Complex, DLSA Kalaburagi',
      landline: '08472-255667',
      whatsapp: '919448033445',
    },
  };

  const currentContact = districtDirectory[selectedHelpDistrict] || districtDirectory['Mandya'];

  const validateForm = () => {
    const tempErrors = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please provide a valid email address';
    }
    if (!password || password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    if (isRegisterMode && !name.trim()) {
      tempErrors.name = 'Full name is required';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const response = await authService.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          district,
          language,
          specialization: specialization.trim(),
        });
        const { token, user } = response.data;
        onLoginSuccess(token, user);
      } else {
        const response = await authService.login(email.trim().toLowerCase(), password);
        const { token, user } = response.data;
        onLoginSuccess(token, user);
      }
    } catch (err) {
      setApiError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-charcoal-950 flex flex-col lg:flex-row">
      {/* Left Column: National Helpline & Location-based Nyaaya Mitra Finder */}
      <div className="lg:w-5/12 bg-charcoal-950 text-sand-50 p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-charcoal-800">
        {/* Brand Header */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-charcoal-900 border border-charcoal-700 text-sand-50 shadow-corporate">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-sand-50 block leading-tight">OutLawed</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-taupe-400">Institutional Legal Aid Platform</span>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-sand-50 leading-snug">
              24x7 Legal Aid Helpline & District Nyaaya Mitra Directory
            </h2>
            <p className="text-xs text-sand-300/80 leading-relaxed">
              If you require emergency legal assistance, free counsel representation, or need to reach your assigned local paralegal volunteer, use the official contacts below.
            </p>
          </div>
        </div>

        {/* Toll-Free National Helplines & Location Directory */}
        <div className="my-6 space-y-4">
          {/* National NALSA Toll-Free Card */}
          <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-3 shadow-corporate">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-charcoal-800 text-sand-200">
                  <PhoneCall className="h-4 w-4 text-taupe-300" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-taupe-400 block">National Legal Aid</span>
                  <h4 className="text-xs font-bold text-sand-50">NALSA 24x7 Toll-Free Helpline</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sand-200/10 text-sand-200 border border-sand-200/20">
                Toll Free
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href="tel:15100"
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sand-100 hover:bg-sand-200 text-charcoal-950 font-black text-sm transition-all border border-sand-300 shadow-corporate"
              >
                <Phone className="h-4 w-4" />
                <span>Call 15100</span>
              </a>
              <a
                href="tel:18004259988"
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-sand-100 font-bold text-xs transition-all border border-charcoal-700"
              >
                <Phone className="h-3.5 w-3.5 text-taupe-300" />
                <span>1800-425-9988 (State)</span>
              </a>
            </div>
            <p className="text-[10px] text-sand-400 leading-tight">
              Toll-free tele-counseling available 24 hours in Kannada, English, Hindi, and regional languages.
            </p>
          </div>

          {/* Location-Based Nyaaya Mitra Contact Lookup */}
          <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-3 shadow-corporate">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-taupe-400" />
                <span className="text-xs font-bold text-sand-50">Local Nyaaya Mitra Desk</span>
              </div>
              
              {/* Location Select Dropdown */}
              <div className="relative">
                <select
                  value={selectedHelpDistrict}
                  onChange={(e) => setSelectedHelpDistrict(e.target.value)}
                  className="appearance-none bg-charcoal-800 text-sand-100 text-xs font-bold py-1.5 pl-3 pr-7 rounded-lg border border-charcoal-700 focus:outline-none focus:ring-1 focus:ring-taupe-400 cursor-pointer"
                >
                  {Object.keys(districtDirectory).map((dist) => (
                    <option key={dist} value={dist} className="bg-charcoal-900 text-sand-50">
                      {dist} District
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-3.5 w-3.5 text-sand-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Selected District Details */}
            <div className="p-3 rounded-lg bg-charcoal-950/80 border border-charcoal-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-taupe-400 block font-medium">Assigned Coordinator</span>
                  <h5 className="text-xs font-bold text-sand-100">{currentContact.mitraName}</h5>
                </div>
                <span className="text-[10px] text-sand-400 font-mono">{currentContact.landline}</span>
              </div>

              <div className="text-[11px] text-sand-400">
                <span className="block truncate">{currentContact.desk}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`tel:${currentContact.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-sand-200 hover:bg-sand-300 text-charcoal-950 text-xs font-bold transition-all border border-sand-400"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{currentContact.phone}</span>
                </a>

                <a
                  href={`https://wa.me/${currentContact.whatsapp}?text=Hello%20Nyaaya%20Mitra,%20I%20need%20legal%20aid%20assistance%20in%20${selectedHelpDistrict}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-charcoal-800 hover:bg-charcoal-700 text-sand-200 text-xs font-bold border border-charcoal-700"
                  title="Connect via WhatsApp"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-sand-200" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-charcoal-800/80 text-[11px] text-sand-500 flex items-center justify-between">
          <span>District Legal Services Authority (DLSA)</span>
          <span className="text-taupe-400 font-medium">Free Legal Services Act 1987</span>
        </div>
      </div>

      {/* Right Column: Authentication Card & Form */}
      <div className="lg:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-lg space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-black tracking-tight text-charcoal-950">
              {isRegisterMode ? 'Register Platform Account' : 'Authorized Workspace Access'}
            </h2>
            <p className="text-xs text-charcoal-500 mt-1">
              {isRegisterMode
                ? 'Create an institutional account to participate in legal aid operations.'
                : 'Sign in to access your designated role workspace, cases, and AI tools.'}
            </p>
          </div>

          {/* Authentication Card */}
          <div className="bg-white rounded-2xl border border-sand-200/90 shadow-corporate p-6 sm:p-8 space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-sand-100/80 p-1 border border-sand-200">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setApiError(null);
                  setErrors({});
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all tracking-tight ${
                  !isRegisterMode
                    ? 'bg-charcoal-900 text-sand-50 shadow-corporate'
                    : 'text-charcoal-600 hover:text-charcoal-950'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setApiError(null);
                  setErrors({});
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all tracking-tight ${
                  isRegisterMode
                    ? 'bg-charcoal-900 text-sand-50 shadow-corporate'
                    : 'text-charcoal-600 hover:text-charcoal-950'
                }`}
              >
                Create Account
              </button>
            </div>

            {apiError && (
              <div>
                <ErrorMessage title="Authentication Notice" message={apiError} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegisterMode && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-charcoal-800 mb-1">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <User className="h-4 w-4 text-charcoal-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Adv. Rajeshwar Gowda"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                        className={`block w-full rounded-lg bg-sand-50/50 border pl-9 pr-3 py-2 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-charcoal-600 ${
                          errors.name ? 'border-red-500' : 'border-sand-300'
                        }`}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-charcoal-800 mb-1">Assigned Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={isLoading}
                        className="block w-full rounded-lg bg-sand-50/50 border border-sand-300 px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-charcoal-600"
                      >
                        <option value="PARALEGAL">Paralegal / Volunteer</option>
                        <option value="CASE_MANAGER">Case Manager</option>
                        <option value="LEGAL_EXPERT">Legal Expert / Counsel</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal-800 mb-1">Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={isLoading}
                        className="block w-full rounded-lg bg-sand-50/50 border border-sand-300 px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-charcoal-600"
                      >
                        <option value="kn">Kannada (kn)</option>
                        <option value="en">English (en)</option>
                        <option value="hi">Hindi (hi)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal-800 mb-1">Operating District</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      disabled={isLoading}
                      className="block w-full rounded-lg bg-sand-50/50 border border-sand-300 px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-charcoal-600"
                    >
                      <option value="Mandya">Mandya</option>
                      <option value="Bengaluru Urban">Bengaluru Urban</option>
                      <option value="Bengaluru Rural">Bengaluru Rural</option>
                      <option value="Mysuru">Mysuru</option>
                      <option value="Tumakuru">Tumakuru</option>
                      <option value="All Districts">All Districts (State Level)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal-800 mb-1">
                      Specialization (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Land Disputes / PWDVA / Labor Rights"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      disabled={isLoading}
                      className="block w-full rounded-lg bg-sand-50/50 border border-sand-300 px-3 py-2 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-charcoal-600"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-charcoal-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className={`block w-full rounded-lg bg-sand-50/50 border pl-9 pr-3 py-2 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-charcoal-600 ${
                      errors.email ? 'border-red-500' : 'border-sand-300'
                    }`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1">
                  Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-charcoal-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className={`block w-full rounded-lg bg-sand-50/50 border pl-9 pr-3 py-2 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-charcoal-600 ${
                      errors.password ? 'border-red-500' : 'border-sand-300'
                    }`}
                  />
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full py-2.5 text-xs font-bold shadow-corporate bg-charcoal-900 hover:bg-charcoal-800 text-sand-50 rounded-lg border border-charcoal-950"
                >
                  {isRegisterMode ? 'Complete Registration & Access Workspace' : 'Sign In to Workspace'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
