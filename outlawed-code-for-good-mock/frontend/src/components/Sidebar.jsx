import React from 'react';
import { 
  LayoutDashboard, 
  FolderPlus, 
  BookOpen, 
  User, 
  X, 
  Scale, 
  AlertTriangle, 
  Users, 
  FileCheck2, 
  Briefcase, 
  ShieldCheck, 
  Sparkles,
  Award,
  History,
  Archive
} from 'lucide-react';

/**
 * Role-Aware Sidebar Component
 */
export default function Sidebar({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
  user,
}) {
  const normalizeRole = (r = '') => {
    const roleStr = r.toLowerCase();
    if (roleStr === 'paralegal' || roleStr === 'nyaaya_mitra') return 'nyaaya_mitra';
    if (roleStr === 'case_manager') return 'case_manager';
    if (roleStr === 'legal_expert') return 'legal_expert';
    if (roleStr === 'admin') return 'admin';
    return 'nyaaya_mitra';
  };

  const role = normalizeRole(user?.role);

  // Role-specific navigation items
  const getMenuItems = () => {
    switch (role) {
      case 'nyaaya_mitra':
        return [
          { id: 'dashboard', label: 'My Cases & Priority Board', icon: LayoutDashboard },
          { id: 'previous_cases', label: 'Previous / Resolved Cases', icon: History },
          { id: 'add_case', label: 'Add Case Intake', icon: FolderPlus, badge: 'New' },
          { id: 'knowledge', label: 'AI Legal Copilot & RAG', icon: Sparkles, highlight: true },
          { id: 'profile', label: 'My Profile & Metrics', icon: User },
        ];
      case 'case_manager':
        return [
          { id: 'dashboard', label: 'District Case Dashboard', icon: LayoutDashboard },
          { id: 'previous_cases', label: 'Archived & Disposed Cases', icon: Archive },
          { id: 'delayed_monitor', label: 'Pending & Delayed Cases', icon: AlertTriangle, alertBadge: true },
          { id: 'expert_requests', label: 'Legal Expert Escalations', icon: FileCheck2 },
          { id: 'volunteers', label: 'Volunteer Performance', icon: Award },
          { id: 'knowledge', label: 'Legal Knowledge Base', icon: BookOpen },
          { id: 'profile', label: 'Coordinator Profile', icon: User },
        ];
      case 'legal_expert':
        return [
          { id: 'dashboard', label: 'Assigned Complex Cases', icon: Briefcase },
          { id: 'previous_cases', label: 'Previous Cases & Opinions', icon: Archive },
          { id: 'knowledge', label: 'Legal Acts & RAG Precedents', icon: BookOpen },
          { id: 'profile', label: 'Counsel Profile', icon: User },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'User & Role Management', icon: Users },
          { id: 'system_stats', label: 'System Overview & Seeder', icon: ShieldCheck },
          { id: 'knowledge', label: 'Legal Knowledge Base', icon: BookOpen },
          { id: 'profile', label: 'Admin Profile', icon: User },
        ];
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'previous_cases', label: 'Previous Cases', icon: History },
          { id: 'knowledge', label: 'Legal Knowledge', icon: BookOpen },
          { id: 'profile', label: 'Profile', icon: User },
        ];
    }
  };

  const menuItems = getMenuItems();

  const getLinkClass = (itemId, isHighlight) => {
    const base = "flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-lg transition-all group tracking-tight";
    if (currentPage === itemId) {
      return `${base} bg-sand-200/80 text-charcoal-950 border-l-4 border-charcoal-900 shadow-corporate font-bold`;
    }
    if (isHighlight) {
      return `${base} text-taupe-900 bg-sand-100/60 hover:bg-sand-150 border-l-4 border-transparent`;
    }
    return `${base} text-charcoal-600 hover:bg-sand-100/60 hover:text-charcoal-950 border-l-4 border-transparent`;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#fcfbfa] border-r border-sand-200">
      {/* Sidebar Header */}
      <div className="flex h-16 shrink-0 items-center px-5 border-b border-charcoal-800 justify-between bg-charcoal-950 text-sand-50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-charcoal-800 text-sand-100 border border-charcoal-700 shadow">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-sand-50 block">OutLawed</span>
            <span className="text-[10px] text-taupe-300 font-medium capitalize">
              {role.replace('_', ' ')} Workspace
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-charcoal-400 hover:text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Role Context Bar */}
      <div className="p-3 bg-sand-100/60 border-b border-sand-200">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-taupe-700 uppercase tracking-wider">Active Jurisdiction</span>
          <span className="text-[10px] font-bold text-charcoal-900 bg-sand-200 px-2 py-0.5 rounded-md border border-sand-300">
            {user?.district || 'Bengaluru Urban'}
          </span>
        </div>
        <p className="text-xs font-bold text-charcoal-900 mt-1 truncate">{user?.name || 'Authorized User'}</p>
        <p className="text-[10px] text-charcoal-500 truncate">{user?.specialization || user?.email}</p>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
        <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-400 mb-2">Navigation</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              className="w-full text-left"
            >
              <div className={getLinkClass(item.id, item.highlight)}>
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-charcoal-950' : 'text-charcoal-400 group-hover:text-charcoal-700'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sand-300 text-charcoal-900">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-taupe-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-taupe-500"></span>
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-3 border-t border-sand-200 bg-sand-100/40 text-center">
        <div className="flex items-center justify-center gap-1.5 text-taupe-900 text-xs font-bold">
          <Sparkles className="h-3.5 w-3.5 text-taupe-600" />
          <span>RAG AI Legal Engine</span>
        </div>
        <p className="text-[10px] text-charcoal-500 mt-0.5">NALSA & Statutory Precedents Grounded</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64 lg:overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={onClose} 
          />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs transition duration-300 ease-in-out">
            <div className="w-full flex-1">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
