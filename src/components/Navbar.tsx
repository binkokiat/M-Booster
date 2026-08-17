import React, { useState } from 'react';
import { Officer } from '../types';
import { 
  Users, 
  UserPlus, 
  BookOpen, 
  ChevronDown, 
  LogOut, 
  Cloud, 
  HardDrive, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Brain, 
  Compass, 
  Flame, 
  Eye, 
  Award, 
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string, subTab?: string) => void;
  currentUser: Officer;
  onSwitchOfficer: (role: Officer['role']) => void;
  isOnline: boolean;
  isLocalData: boolean;
  onToggleLocalData: (local: boolean) => void;
  localDataCount: number;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onSwitchOfficer,
  isOnline,
  isLocalData,
  onToggleLocalData,
  localDataCount,
  onLogout
}) => {
  const [infoDropdownOpen, setInfoDropdownOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const infoSubMenus = [
    { id: 'import_info', name: 'Import / Export Information', icon: FileSpreadsheet },
    { id: 'char1', name: 'ลักษณะนิสัย 1', icon: Brain },
    { id: 'char2', name: 'ลักษณะนิสัย 2', icon: Layers },
    { id: 'conceptual', name: 'ลักษณะทางความคิด', icon: Compass },
    { id: 'habit', name: 'คำแนะนำตามลักษณะนิสัย', icon: ShieldCheck },
    { id: 'motivation', name: 'แรงจูงใจในภาพรวม', icon: Flame },
    { id: 'awareness', name: 'ช่องทางการรับข้อมูล', icon: Eye },
    { id: 'potential_graph', name: 'กราฟค่าศักยภาพและศักยภาพ 10 ด้าน', icon: Award },
    { id: 'activities', name: 'กิจกรรมตามค่าศักยภาพ', icon: Activity },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center space-x-6">
            <div 
              className="flex items-center space-x-3 cursor-pointer py-1"
              onClick={() => onSelectTab('user_list')}
            >
              <img 
                src="/assets/images/logo mind booster-mini.png" 
                alt="Mind Booster Logo" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  // fallback
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <span className="text-lg font-bold tracking-tight text-[#466BB2]">Mind Booster</span>
                <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-[#466BB2] border border-blue-200">
                  Dermatoglyphics
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => onSelectTab('user_list')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentTab === 'user_list'
                    ? 'bg-[#466BB2] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#466BB2] hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Client</span>
              </button>

              <button
                onClick={() => onSelectTab('add_user')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentTab === 'add_user'
                    ? 'bg-[#A3CB38] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#A3CB38] hover:bg-slate-100'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Client</span>
              </button>

              {/* Information Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setInfoDropdownOpen(!infoDropdownOpen)}
                  onBlur={() => setTimeout(() => setInfoDropdownOpen(false), 200)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab.startsWith('info_')
                      ? 'bg-[#466BB2] text-white'
                      : 'text-slate-600 hover:text-[#466BB2] hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Information</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${infoDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {infoDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50 duration-150">
                    <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      ฐานข้อมูลความรู้ Mind Booster
                    </div>
                    {infoSubMenus.map((sub) => {
                      const Icon = sub.icon;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            onSelectTab('info_' + sub.id);
                            setInfoDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-slate-700 hover:bg-blue-50 hover:text-[#466BB2] flex items-center space-x-3 transition-colors"
                        >
                          <Icon className="w-4 h-4 text-[#466BB2] shrink-0" />
                          <span className="truncate">{sub.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right: Sync Status & Officer Profile */}
          <div className="flex items-center space-x-4">
            {/* Local / Cloud Toggle Pill */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => onToggleLocalData(true)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
                  isLocalData 
                    ? 'bg-[#74B9FF] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Local ({localDataCount})</span>
              </button>
              <button
                onClick={() => onToggleLocalData(false)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
                  !isLocalData 
                    ? 'bg-[#466BB2] text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Cloud</span>
              </button>
            </div>

            {/* Online Status Indicator */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="hidden md:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Officer Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                onBlur={() => setTimeout(() => setProfileMenuOpen(false), 200)}
                className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#466BB2] text-white flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</div>
                  <div className="text-[11px] font-medium text-[#466BB2] capitalize">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in-50 duration-150">
                  <div className="px-4 pb-3 border-b border-slate-100 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#466BB2] text-white flex items-center justify-center font-bold text-base">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</div>
                      <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                      <div className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#466BB2] border border-blue-200">
                        {currentUser.role}
                      </div>
                    </div>
                  </div>

                  {/* Switch Role Quick Toggle */}
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      สลับบทบาทเจ้าหน้าที่ (Role)
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          onSwitchOfficer('collector');
                          setProfileMenuOpen(false);
                        }}
                        className={`text-xs py-1.5 px-2 rounded-md font-medium text-center transition-colors ${
                          currentUser.role === 'collector'
                            ? 'bg-[#466BB2] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Collector
                      </button>
                      <button
                        onClick={() => {
                          onSwitchOfficer('analyst');
                          setProfileMenuOpen(false);
                        }}
                        className={`text-xs py-1.5 px-2 rounded-md font-medium text-center transition-colors ${
                          currentUser.role === 'analyst'
                            ? 'bg-[#466BB2] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Analyst
                      </button>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <div className="px-2 pt-2">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ออกจากระบบ (Log out)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Submenu Navigation */}
      <div className="md:hidden border-t border-slate-200 px-4 py-2 flex items-center space-x-2 overflow-x-auto bg-slate-50">
        <button
          onClick={() => onSelectTab('user_list')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 ${
            currentTab === 'user_list' ? 'bg-[#466BB2] text-white' : 'text-slate-600 bg-white border border-slate-200'
          }`}
        >
          Client List
        </button>
        <button
          onClick={() => onSelectTab('add_user')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 ${
            currentTab === 'add_user' ? 'bg-[#A3CB38] text-white' : 'text-slate-600 bg-white border border-slate-200'
          }`}
        >
          Add Client
        </button>
        <button
          onClick={() => onSelectTab('info_char1')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 ${
            currentTab.startsWith('info_') ? 'bg-[#466BB2] text-white' : 'text-slate-600 bg-white border border-slate-200'
          }`}
        >
          Information
        </button>
      </div>
    </header>
  );
};
