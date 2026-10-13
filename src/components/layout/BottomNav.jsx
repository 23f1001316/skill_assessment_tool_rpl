import { Home, FolderPlus, Sparkles, Award, Users, ClipboardCheck, FileSearch, ShieldCheck, UserCheck, BookOpen, ScrollText, Database, BarChart3, LayoutDashboard } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BottomNav = ({ activeTab, onTabChange }) => {
  const { activeRole } = useApp();

  let tabs = [];

  if (activeRole === 'worker') {
    tabs = [
      { id: 'overview', label: 'Overview', icon: Home },
      { id: 'evidence', label: 'Evidence', icon: FolderPlus },
      { id: 'ai', label: 'AI Review', icon: Sparkles },
      { id: 'status', label: 'RPL Card', icon: Award }
    ];
  } else if (activeRole === 'assessor') {
    tabs = [
      { id: 'dashboard', label: 'Dashboard', icon: Users },
      { id: 'review', label: 'Review', icon: FileSearch },
      { id: 'competencies', label: 'Matrix', icon: ClipboardCheck },
      { id: 'evidence', label: 'Evidence', icon: FolderPlus },
      { id: 'summary', label: 'Summary', icon: ShieldCheck }
    ];
  } else if (activeRole === 'coordinator') {
    tabs = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'applications', label: 'Apps', icon: Users },
      { id: 'data_review', label: 'Review', icon: Database },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
      { id: 'audit', label: 'Audit', icon: ScrollText }
    ];
  }

  if (tabs.length === 0) return null;

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors relative ${
                isActive ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-teal-50' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-teal-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
