import React from 'react';
import { Menu, LogOut, Scale, MapPin, Globe } from 'lucide-react';

/**
 * Reusable Navbar Component with Active Role Indicator
 */
export default function Navbar({
  projectName = 'OutLawed',
  user,
  onMenuClick,
  onLogout,
}) {
  const getRoleConfig = (role = '') => {
    const r = role.toLowerCase();
    if (r === 'paralegal' || r === 'nyaaya_mitra') {
      return {
        label: 'Paralegal Volunteer',
        badge: 'bg-sand-100 text-taupe-900 border-sand-300',
        dot: 'bg-taupe-600',
      };
    }
    if (r === 'case_manager') {
      return {
        label: 'District Case Manager',
        badge: 'bg-charcoal-100 text-charcoal-900 border-charcoal-200',
        dot: 'bg-charcoal-700',
      };
    }
    if (r === 'legal_expert') {
      return {
        label: 'Legal Counsel / Senior Advocate',
        badge: 'bg-slate-100 text-slate-900 border-slate-300',
        dot: 'bg-slate-700',
      };
    }
    if (r === 'admin') {
      return {
        label: 'System Administrator',
        badge: 'bg-sand-200 text-charcoal-950 border-sand-400 font-bold',
        dot: 'bg-charcoal-900',
      };
    }
    return {
      label: 'Paralegal',
      badge: 'bg-sand-100 text-taupe-900 border-sand-300',
      dot: 'bg-taupe-600',
    };
  };

  const roleInfo = getRoleConfig(user?.role);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-sand-200 bg-[#fcfbfa]/95 backdrop-blur-md px-4 shadow-corporate sm:px-6 lg:px-8">
      {/* Left side: Hamburger and Platform Brand */}
      <div className="flex items-center gap-x-4">
        <button
          type="button"
          className="text-charcoal-500 hover:text-charcoal-900 lg:hidden p-1.5 rounded-md hover:bg-sand-100 focus:outline-none focus:ring-2 focus:ring-charcoal-600"
          onClick={onMenuClick}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-charcoal-900 text-sand-50 border border-charcoal-950 shadow-corporate">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-charcoal-950 tracking-tight">
                {projectName}
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sand-100 text-taupe-800 border border-sand-300">
                Editorial Legal Platform
              </span>
            </div>
            <p className="hidden sm:block text-[10px] text-charcoal-400 font-medium tracking-tight">
              Intelligent Case & Knowledge Management
            </p>
          </div>
        </div>
      </div>

      {/* Right: District, Language, Role Badge, User Info, Sign Out */}
      <div className="flex items-center gap-x-3 sm:gap-x-4">
        {/* District Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sand-50 border border-sand-200 text-xs font-semibold text-charcoal-700">
          <MapPin className="h-3.5 w-3.5 text-taupe-600" />
          <span>{user?.district || 'Mandya'}</span>
        </div>

        {/* Language Badge */}
        {user?.language && (
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-charcoal-50 border border-charcoal-200 text-[11px] font-semibold text-charcoal-700 uppercase">
            <Globe className="h-3 w-3 text-charcoal-500" />
            <span>{user.language}</span>
          </div>
        )}

        {/* Role Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold shadow-corporate ${roleInfo.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${roleInfo.dot}`} />
          <span>{roleInfo.label}</span>
        </div>

        {/* Vertical divider */}
        <div className="hidden sm:block h-6 w-px bg-sand-200" aria-hidden="true" />

        {/* User Info & Avatar */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-200 text-charcoal-900 font-bold border border-sand-300 text-xs shadow-corporate">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-charcoal-900 leading-tight truncate max-w-[140px]">
              {user?.name || 'User'}
            </span>
            <span className="text-[10px] text-charcoal-400 truncate max-w-[140px]">
              {user?.email}
            </span>
          </div>
        </div>

        {/* Sign Out */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1 text-xs font-semibold text-charcoal-600 hover:text-stone-900 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-sand-100 focus:outline-none"
          title="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
