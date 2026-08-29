import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { User, Shield, CheckCircle2, MapPin, Award, Scale, Briefcase } from 'lucide-react';

/**
 * Enhanced Profile Component for NyaayaSetu Legal Aid Personnel
 */
export default function Profile({ user, onUserUpdate }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialization, setSpecialization] = useState(user?.specialization || '');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  const roleLabels = {
    nyaaya_mitra: 'Nyaaya Mitra / Paralegal Volunteer',
    case_manager: 'District Case Manager / DLSA Coordinator',
    legal_expert: 'Legal Expert / Senior Advocate',
    admin: 'System Administrator'
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrors({});

    if (!name.trim()) {
      setErrors({ name: 'Name cannot be blank' });
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Provide a valid email address' });
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const updatedUser = { ...user, name, email, phone, specialization };
      onUserUpdate(updatedUser);
      setSuccessMessage('Profile information saved successfully!');
    } catch (err) {
      setErrors({ global: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900">Personnel Profile & Performance</h1>
        <p className="text-xs text-gray-500">Manage your legal aid credentials, operating jurisdiction, and contact details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Summary */}
        <div className="md:col-span-1 space-y-4">
          <Card className="text-center !py-6 shadow-sm">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-tr from-indigo-100 to-primary-100 text-primary-700 flex items-center justify-center border border-primary-200 shadow-md mb-4 font-bold text-2xl">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{user?.name}</h2>
            <p className="text-xs text-gray-500">{user?.email}</p>
            
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
              <Shield className="h-3.5 w-3.5 text-primary-600" />
              {roleLabels[user?.role] || 'Legal Aid Personnel'}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-150 text-xs text-gray-600 space-y-1.5 text-left">
              <p className="flex items-center justify-between">
                <span className="text-gray-400">Jurisdiction:</span>
                <span className="font-bold text-gray-800">{user?.district || 'Bengaluru Urban'}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-400">Specialization:</span>
                <span className="font-bold text-gray-800 truncate max-w-[140px]">
                  {user?.specialization || 'General Legal Aid'}
                </span>
              </p>
            </div>
          </Card>

          {/* Metrics Card */}
          {user?.metrics && (
            <Card title="Volunteer Impact Metrics">
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-150">
                  <span className="text-[10px] text-gray-400 block">Cases Handled</span>
                  <span className="text-base font-bold text-gray-900">{user.metrics.casesHandled || 28}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-150">
                  <span className="text-[10px] text-gray-400 block">Field Visits</span>
                  <span className="text-base font-bold text-purple-700">{user.metrics.fieldVisitsCount || 42}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-150">
                  <span className="text-[10px] text-gray-400 block">Resolved</span>
                  <span className="text-base font-bold text-emerald-700">{user.metrics.resolvedCount || 19}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-150">
                  <span className="text-[10px] text-gray-400 block">Rating</span>
                  <span className="text-base font-bold text-yellow-600">⭐ {user.metrics.rating || 4.9}</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Card: Form Settings */}
        <div className="md:col-span-2">
          <Card title="Account Credentials & Profile Settings" subtitle="Update your personnel details.">
            {successMessage && (
              <div className="mb-4 rounded-md bg-green-50 p-4 border border-green-200 flex items-start gap-2 text-xs text-green-800 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                {successMessage}
              </div>
            )}

            {errors.global && (
              <p className="mb-4 text-xs text-red-600 font-semibold">{errors.global}</p>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <Input
                label="Full Name"
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                disabled={isLoading}
              />

              <Input
                label="Email Address"
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                disabled={isLoading}
              />

              <Input
                label="Phone Contact"
                id="profile-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 XXXXX"
                disabled={isLoading}
              />

              <Input
                label="Specialization / Department"
                id="profile-spec"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Rural Land Law / Women & Child Welfare"
                disabled={isLoading}
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isLoading}>
                  Save Profile Details
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
