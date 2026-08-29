import React, { useState } from 'react';
import { 
  Users, 
  Folder, 
  TrendingUp, 
  Activity, 
  PlusCircle, 
  FileText, 
  Database,
  Eye,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

// ==========================================
// MOCK DATASET
// ==========================================
const INITIAL_TABLE_DATA = [
  { id: '1', name: 'Community Outreach Portal', category: 'Web App', status: 'completed', date: '2026-08-27' },
  { id: '2', name: 'Food Bank Distribution Tracker', category: 'Mobile App', status: 'progress', date: '2026-08-28' },
  { id: '3', name: 'Shelter Allocations Optimizer', category: 'Algorithm', status: 'pending', date: '2026-08-25' },
  { id: '4', name: 'Volunteer Registry API', category: 'Backend', status: 'active', date: '2026-08-26' },
  { id: '5', name: 'Crisis Hotlines Connector', category: 'Integration', status: 'inactive', date: '2026-08-20' },
];

const INITIAL_ACTIVITIES = [
  { id: 'a1', action: 'Created record', target: 'Community Outreach Portal', user: 'Alex Johnson', time: '10 mins ago' },
  { id: 'a2', action: 'Modified status', target: 'Food Bank Distribution Tracker', user: 'Sarah Connor', time: '1 hour ago' },
  { id: 'a3', action: 'Triggered pipeline', target: 'Volunteer Registry API', user: 'Dev Team', time: '2 hours ago' },
];

/**
 * Dashboard Page View Component
 * @param {Object} props
 * @param {Object} props.user - current logged in user metadata
 */
export default function Dashboard({ user = { name: '[USER NAME]' } }) {
  // Data States
  const [tableData, setTableData] = useState(INITIAL_TABLE_DATA);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);

  // Table Demonstration States
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isTableEmpty, setIsTableEmpty] = useState(false);

  // Form States
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formFile, setFormFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formStatus, setFormStatus] = useState('idle'); // idle | loading | success | error
  const [formStatusMessage, setFormStatusMessage] = useState('');

  // Modal Details State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Statistics Card Config (Domain-Neutral)
  const stats = [
    { label: '[STAT 1] Total Cases', value: '3,842', icon: Users, desc: '+12% from last week', color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { label: '[STAT 2] Applications', value: '1,240', icon: Folder, desc: '98 pending triage', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { label: '[STAT 3] Impact Score', value: '94.8%', icon: TrendingUp, desc: '+1.4% improvement', color: 'text-green-600 bg-green-50 border-green-100' },
    { label: '[STAT 4] API Requests', value: '45.2k', icon: Activity, desc: 'Response rate 99.98ms', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
  ];

  // ==========================================
  // FORM ACTIONS
  // ==========================================
  const validateForm = () => {
    const tempErrors = {};
    if (!formName.trim()) tempErrors.name = '[FIELD NAME] is required';
    if (!formDesc.trim()) tempErrors.desc = '[FIELD DESCRIPTION] is required';
    if (!formCategory) tempErrors.category = '[CATEGORY] selection is required';
    setFormErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormStatusMessage('');

    if (!validateForm()) return;

    setFormStatus('loading');

    try {
      // Simulate API call for [SUBMIT ACTION]
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Append new entry to the data table
      const newRecord = {
        id: String(tableData.length + 1),
        name: formName,
        category: formCategory,
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      };

      setTableData([newRecord, ...tableData]);
      
      // Append activity log
      const newActivity = {
        id: `a${Date.now()}`,
        action: 'Added entry',
        target: formName,
        user: user.name,
        time: 'Just now'
      };
      setActivities([newActivity, ...activities]);

      // Trigger success state
      setFormStatus('success');
      setFormStatusMessage('Operation completed successfully.');
      
      // Clear inputs
      setFormName('');
      setFormDesc('');
      setFormCategory('');
      setFormFile(null);
    } catch (err) {
      setFormStatus('error');
      setFormStatusMessage('Something went wrong. Please try again.');
    }
  };

  const handleFormCancel = () => {
    setFormName('');
    setFormDesc('');
    setFormCategory('');
    setFormFile(null);
    setFormErrors({});
    setFormStatus('idle');
    setFormStatusMessage('');
  };

  // ==========================================
  // TABLE ACTIONS
  // ==========================================
  const handleOpenDetails = (record) => {
    setSelectedRecord(record);
    setIsDetailsModalOpen(true);
  };

  const handleToggleTableState = (stateType) => {
    if (stateType === 'loading') {
      setIsTableLoading(!isTableLoading);
    } else if (stateType === 'empty') {
      setIsTableEmpty(!isTableEmpty);
    }
  };

  // Reusable columns definition (easy to customize tomorrow)
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { 
      key: 'status', 
      label: 'Status',
      render: (status) => <StatusBadge status={status} />
    },
    { key: 'date', label: 'Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="!px-2 !py-1 text-xs flex items-center gap-1 border-gray-200 hover:bg-gray-150 hover:text-primary-600"
            onClick={() => handleOpenDetails(row)}
          >
            <Eye className="h-3 w-3" />
            View
          </Button>
          <Button
            variant="outline"
            className="!px-2 !py-1 text-xs flex items-center gap-1 border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            onClick={() => {
              setTableData(tableData.filter(item => item.id !== row.id));
              // Log activity
              setActivities([{
                id: `a${Date.now()}`,
                action: 'Deleted entry',
                target: row.name,
                user: user.name,
                time: 'Just now'
              }, ...activities]);
            }}
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-gray-500">
            Here's a review of your application metrics. Customize these values tomorrow.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-xs font-semibold bg-white border-gray-300"
            onClick={() => {
              setTableData(INITIAL_TABLE_DATA);
              setActivities(INITIAL_ACTIVITIES);
            }}
          >
            Reset Starter Data
          </Button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="!px-4 !py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 leading-none">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg border ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3.5 flex items-center text-xs text-gray-400">
                <span>{stat.desc}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column: Form & Table (Takes up 2 cols on wide screens) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Reusable Form Template Card */}
          <Card 
            title="Form Template Example" 
            subtitle="Demonstrates file upload, input validation, and loading/success/error statuses."
          >
            {/* Form Success/Error banners */}
            {formStatus === 'success' && (
              <div className="mb-4 rounded-md bg-green-50 p-4 border border-green-200 flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <div className="text-sm font-semibold text-green-800">{formStatusMessage}</div>
              </div>
            )}
            {formStatus === 'error' && (
              <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200 flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm font-semibold text-red-800">{formStatusMessage}</div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="[FIELD NAME] Project Name"
                  id="form-name"
                  placeholder="Enter project name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  error={formErrors.name}
                  disabled={formStatus === 'loading'}
                />

                <Select
                  label="[CATEGORY] Platform Category"
                  id="form-category"
                  placeholder="Select a category"
                  options={[
                    { value: 'Web App', label: 'Web App' },
                    { value: 'Mobile App', label: 'Mobile App' },
                    { value: 'Algorithm', label: 'Algorithm' },
                    { value: 'Backend', label: 'Backend' },
                    { value: 'Integration', label: 'Integration' },
                  ]}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  error={formErrors.category}
                  disabled={formStatus === 'loading'}
                />
              </div>

              {/* Textarea component coded directly or as standard input */}
              <div>
                <label htmlFor="form-description" className="block text-sm font-medium text-gray-700 mb-1">
                  [FIELD DESCRIPTION] Project Objective
                </label>
                <textarea
                  id="form-description"
                  rows={3}
                  placeholder="Enter detailed description..."
                  className={`block w-full rounded-md shadow-sm text-sm transition-colors focus:ring-primary-500 focus:border-primary-500
                    ${formErrors.desc ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
                  `}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  disabled={formStatus === 'loading'}
                />
                {formErrors.desc && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.desc}</p>
                )}
              </div>

              {/* Optional File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Optional Resource Upload
                </label>
                <div className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-4 hover:border-primary-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <FileText className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="flex text-xs text-gray-650">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 hover:text-primary-500">
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={(e) => setFormFile(e.target.files[0])}
                          disabled={formStatus === 'loading'}
                        />
                      </label>
                      <p className="pl-1 text-gray-500">or drag and drop</p>
                    </div>
                    <p className="text-[10px] text-gray-400">PDF, PNG, JPG up to 10MB</p>
                    {formFile && (
                      <p className="text-xs text-primary-600 font-semibold mt-1">
                        Selected: {formFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleFormCancel}
                  disabled={formStatus === 'loading'}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={formStatus === 'loading'}
                >
                  [SUBMIT ACTION] Create Record
                </Button>
              </div>
            </form>
          </Card>

          {/* Configurable Table Card */}
          <Card 
            title="Interactive Data Table" 
            subtitle="Demonstrates tabular presentation with status badges, item deletion, view modal popups, and state toggles."
          >
            {/* Demonstration Toggle Toggles */}
            <div className="flex flex-wrap gap-3 items-center justify-between mb-4 bg-gray-50 p-3 rounded-md border border-gray-200">
              <span className="text-xs font-semibold text-gray-500">Starter Demo States:</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className={`!py-1 !px-2 text-xs font-semibold ${isTableLoading ? 'bg-primary-100 text-primary-800' : 'bg-white'}`}
                  onClick={() => handleToggleTableState('loading')}
                >
                  Toggle Loading ({isTableLoading ? 'ON' : 'OFF'})
                </Button>
                <Button
                  variant="outline"
                  className={`!py-1 !px-2 text-xs font-semibold ${isTableEmpty ? 'bg-primary-100 text-primary-800' : 'bg-white'}`}
                  onClick={() => handleToggleTableState('empty')}
                >
                  Toggle Empty ({isTableEmpty ? 'ON' : 'OFF'})
                </Button>
              </div>
            </div>

            {/* Render table component */}
            <Table
              columns={columns}
              data={isTableEmpty ? [] : tableData}
              isLoading={isTableLoading}
              emptyTitle="No records found"
              emptyMessage="Try adding some records through the form above or resetting starter data."
            />
          </Card>

        </div>

        {/* Right Column: Quick Actions & Recent Activities */}
        <div className="space-y-6">
          
          {/* Quick Actions Card */}
          <Card title="Quick Actions" subtitle="Fast triggers for developer verification.">
            <div className="grid grid-cols-1 gap-2.5">
              <Button
                variant="outline"
                className="w-full justify-start text-left text-xs flex items-center gap-2"
                onClick={() => {
                  alert('Verification: Simulating Backend Ping...');
                  // Real integration tomorrow e.g. apiClient.get('/health')
                }}
              >
                <Database className="h-4 w-4 text-gray-500" />
                Ping API Server
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start text-left text-xs flex items-center gap-2"
                onClick={() => {
                  const seed = {
                    id: String(tableData.length + 1),
                    name: 'Generated Hackathon Hack',
                    category: 'Mockup',
                    status: 'success',
                    date: new Date().toISOString().split('T')[0]
                  };
                  setTableData([seed, ...tableData]);
                }}
              >
                <PlusCircle className="h-4 w-4 text-gray-500" />
                Insert Dummy Row
              </Button>
            </div>
          </Card>

          {/* Recent Activity Card */}
          <Card title="Recent Activity" subtitle="User transactions recorded in this context.">
            <div className="flow-root">
              <ul className="-mb-8">
                {activities.map((item, idx) => (
                  <li key={item.id}>
                    <div className="relative pb-8">
                      {idx !== activities.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 ring-8 ring-white">
                            <PlusCircle className="h-4 w-4" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-xs text-gray-800">
                              {item.action} <span className="font-semibold text-gray-900">{item.target}</span>
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">By {item.user}</p>
                          </div>
                          <div className="text-right text-[10px] whitespace-nowrap text-gray-400 font-semibold">
                            {item.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

        </div>
      </div>

      {/* Reusable Detail Overlay Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Record Detailed Metrics"
        footer={
          <Button onClick={() => setIsDetailsModalOpen(false)}>
            Close Details
          </Button>
        }
      >
        {selectedRecord ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 border-b border-gray-150 pb-2">
              <span className="text-xs font-semibold text-gray-400">Record ID:</span>
              <span className="text-xs font-bold text-gray-950 col-span-2">{selectedRecord.id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 border-b border-gray-150 pb-2">
              <span className="text-xs font-semibold text-gray-400">Platform Name:</span>
              <span className="text-xs font-bold text-gray-950 col-span-2">{selectedRecord.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 border-b border-gray-150 pb-2">
              <span className="text-xs font-semibold text-gray-400">Category:</span>
              <span className="text-xs font-bold text-gray-950 col-span-2">{selectedRecord.category}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 border-b border-gray-150 pb-2">
              <span className="text-xs font-semibold text-gray-400">Current Status:</span>
              <div className="col-span-2">
                <StatusBadge status={selectedRecord.status} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pb-2">
              <span className="text-xs font-semibold text-gray-400">Creation Date:</span>
              <span className="text-xs font-bold text-gray-950 col-span-2">{selectedRecord.date}</span>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-[11px] text-blue-800">
              <strong>Tip for tomorrow:</strong> You can fetch detailed data from the backend route matching this ID and update the parent state.
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No record selected.</p>
        )}
      </Modal>
    </div>
  );
}
