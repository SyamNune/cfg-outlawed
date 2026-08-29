import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  Scale,
  MapPin,
  Sparkles
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { adminService, authService } from '../services/api';

export default function AdminPortal({ user, onRoleChangeTrigger }) {
  const [usersList, setUsersList] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter
  const [roleFilter, setRoleFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit User Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('nyaaya_mitra');
  const [formDistrict, setFormDistrict] = useState('Bengaluru Urban');
  const [formPhone, setFormPhone] = useState('');
  const [formSpecialization, setFormSpecialization] = useState('');
  const [formStatus, setFormStatus] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seeder Status
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccessMessage, setSeedSuccessMessage] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminService.getAllUsers({
          role: roleFilter !== 'all' ? roleFilter : undefined,
          district: districtFilter !== 'all' ? districtFilter : undefined,
          search: searchQuery || undefined
        }),
        adminService.getSystemStats()
      ]);

      setUsersList(usersRes.data.users || []);
      setSystemStats(statsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load administrator records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [roleFilter, districtFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditUserId(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('password123');
    setFormRole('nyaaya_mitra');
    setFormDistrict('Bengaluru Urban');
    setFormPhone('');
    setFormSpecialization('');
    setFormStatus('active');
    setIsUserModalOpen(true);
  };

  const handleOpenEditModal = (u) => {
    setIsEditing(true);
    setEditUserId(u._id);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormPassword('');
    setFormRole(u.role);
    setFormDistrict(u.district || 'Bengaluru Urban');
    setFormPhone(u.phone || '');
    setFormSpecialization(u.specialization || '');
    setFormStatus(u.status || 'active');
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      alert('Name and Email are required.');
      return;
    }
    if (!isEditing && !formPassword) {
      alert('Password is required for new user creation.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await adminService.updateUser(editUserId, {
          name: formName,
          email: formEmail,
          role: formRole,
          district: formDistrict,
          phone: formPhone,
          specialization: formSpecialization,
          status: formStatus
        });
      } else {
        await adminService.createUser({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
          district: formDistrict,
          phone: formPhone,
          specialization: formSpecialization
        });
      }

      setIsUserModalOpen(false);
      fetchData();
      alert(`User ${isEditing ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      alert(err.message || 'Error saving user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Are you sure you want to remove user "${u.name}" (${u.email})?`)) {
      return;
    }

    try {
      await adminService.deleteUser(u._id);
      fetchData();
      alert(`User "${u.name}" removed.`);
    } catch (err) {
      alert(err.message || 'Error deleting user.');
    }
  };

  const handleTriggerSeeder = async () => {
    if (!window.confirm('Re-seed the database with fresh demo records across all roles?')) {
      return;
    }
    setIsSeeding(true);
    setSeedSuccessMessage('');
    try {
      const res = await authService.seedDemo();
      setSeedSuccessMessage(res.data.message || 'Database successfully seeded!');
      fetchData();
    } catch (err) {
      alert(err.message || 'Error seeding database.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              State Master Administration
            </span>
            <span className="text-xs text-rose-200">System Governance Portal</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            User Roles, Jurisdictions & System Control
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Manage all legal aid personnel, modify user roles dynamically, assign district coordinators, and maintain platform health.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleTriggerSeeder}
            isLoading={isSeeding}
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 !py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Database className="h-4 w-4 text-emerald-400" />
            Re-Seed Demo Data
          </Button>

          <Button
            onClick={handleOpenAddModal}
            className="bg-rose-600 hover:bg-rose-700 text-white !py-2 text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <UserPlus className="h-4 w-4" />
            Add New User
          </Button>
        </div>
      </div>

      {seedSuccessMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{seedSuccessMessage}</span>
        </div>
      )}

      {/* System Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4 border-l-4 border-l-rose-500">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Users</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{systemStats?.totalUsers ?? usersList.length}</p>
          <p className="text-[10px] text-gray-400 mt-1">Across all 4 roles</p>
        </Card>

        <Card className="!p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Cases Logged</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{systemStats?.totalCases ?? 0}</p>
          <p className="text-[10px] text-blue-600 font-semibold mt-1">
            {systemStats?.highPriorityCases ?? 0} High Priority
          </p>
        </Card>

        <Card className="!p-4 border-l-4 border-l-purple-500">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Legal Knowledge Base</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{systemStats?.totalKnowledge ?? 0}</p>
          <p className="text-[10px] text-purple-600 font-semibold mt-1">Statutory toolkits indexed</p>
        </Card>

        <Card className="!p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Atlas Database</p>
          <p className="mt-1 text-sm font-bold text-emerald-700 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Connected (Cluster0)
          </p>
          <p className="text-[10px] text-gray-400 mt-1">MongoDB Atlas Shard Live</p>
        </Card>
      </div>

      {/* User Management Table */}
      <Card title="User & Role Management Directory" subtitle="Modify roles, reassign operating districts, and manage access permissions.">
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
          <form onSubmit={handleSearch} className="w-full md:w-80 flex gap-2">
            <input
              type="text"
              placeholder="Search user by name, email, specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-gray-300 px-3 py-1.5"
            />
            <Button type="submit" variant="outline" className="!py-1.5 !px-3 text-xs">Search</Button>
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs rounded-lg border border-gray-300 py-1.5 px-2 text-gray-700 font-semibold"
            >
              <option value="all">All Roles</option>
              <option value="nyaaya_mitra">Nyaaya Mitra</option>
              <option value="case_manager">District Case Manager</option>
              <option value="legal_expert">Legal Expert / Mentor</option>
              <option value="admin">System Administrator</option>
            </select>

            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="text-xs rounded-lg border border-gray-300 py-1.5 px-2 text-gray-700 font-semibold"
            >
              <option value="all">All Districts</option>
              <option value="Bengaluru Urban">Bengaluru Urban</option>
              <option value="Bengaluru Rural">Bengaluru Rural</option>
              <option value="Mysuru">Mysuru</option>
              <option value="Mandya">Mandya</option>
              <option value="Tumakuru">Tumakuru</option>
            </select>

            <Button variant="outline" onClick={fetchData} className="!py-1.5 !px-2 text-xs" title="Refresh">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-8 text-center"><Loading message="Loading users..." /></div>
        ) : error ? (
          <ErrorMessage title="Error" message={error} onRetry={fetchData} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">User Name & Email</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">Assigned Role</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">District</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600">Specialization / Focus</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {usersList.map((u) => {
                  const roleBadges = {
                    nyaaya_mitra: 'bg-emerald-100 text-emerald-800',
                    case_manager: 'bg-blue-100 text-blue-800',
                    legal_expert: 'bg-purple-100 text-purple-800',
                    admin: 'bg-rose-100 text-rose-800'
                  };

                  return (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-900 block">{u.name}</span>
                        <span className="text-[10px] text-gray-400">{u.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleBadges[u.role] || 'bg-gray-100'}`}>
                          {u.role?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{u.district}</td>
                      <td className="px-4 py-3 text-gray-500">{u.specialization || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Role / Details"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT USER & CHANGE ROLES */}
      {/* ======================================================== */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={isEditing ? `Edit User: ${formName}` : 'Add New User Account'}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUser} isLoading={isSubmitting}>
              {isEditing ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
          <Input
            label="Full Name *"
            placeholder="e.g. Anand Gowda"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. anand@nyaaya.org"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
          />

          {!isEditing && (
            <Input
              label="Password *"
              type="password"
              placeholder="Enter initial password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Assigned Role *</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2 text-xs font-bold"
              >
                <option value="nyaaya_mitra">Nyaaya Mitra / Paralegal Volunteer</option>
                <option value="case_manager">District Case Manager / Coordinator</option>
                <option value="legal_expert">Legal Expert / Senior Counsel</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Operating District *</label>
              <select
                value={formDistrict}
                onChange={(e) => setFormDistrict(e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2 text-xs"
              >
                <option value="Bengaluru Urban">Bengaluru Urban</option>
                <option value="Bengaluru Rural">Bengaluru Rural</option>
                <option value="Mysuru">Mysuru</option>
                <option value="Mandya">Mandya</option>
                <option value="Tumakuru">Tumakuru</option>
                <option value="All Districts">All Districts (State Overview)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              placeholder="+91 98450 XXXXX"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />

            <div>
              <label className="block font-bold text-gray-700 mb-1">Account Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2 text-xs font-semibold"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <Input
            label="Specialization / Department"
            placeholder="e.g. Senior High Court Counsel / Rural Land Rights"
            value={formSpecialization}
            onChange={(e) => setFormSpecialization(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
}
