import React, { useState, useEffect } from 'react';
import { 
  ClientProfile, 
  Officer, 
  OfficerRole, 
  ScanStatus 
} from './types';
import { INITIAL_CLIENTS } from './utils/seedData';
import { Navbar } from './components/Navbar';
import { SignIn } from './components/SignIn';
import { Dashboard } from './components/Dashboard';
import { FingerprintStudio } from './components/FingerprintStudio';
import { ReportView } from './components/ReportView';
import { InformationViews } from './components/InformationViews';
import { ImportModal } from './components/ImportModals';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<Officer>({
    id: 'officer_01',
    name: 'สิริพร วงศ์สว่าง (Collector)',
    email: 'collector@mindbooster.com',
    role: 'collector',
    avatarUrl: ''
  });

  // Navigation State: 'user_list' | 'add_user' | 'edit_user' | 'report' | 'info_*'
  const [currentTab, setCurrentTab] = useState<string>('user_list');
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);

  // Clients Data State (with local storage persistence)
  const [clients, setClients] = useState<ClientProfile[]>(() => {
    try {
      const saved = localStorage.getItem('mb_clients');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return INITIAL_CLIENTS;
  });

  // Local / Cloud toggle
  const [isLocalData, setIsLocalData] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Modals
  const [importModalType, setImportModalType] = useState<'data' | 'report' | null>(null);

  // Save clients to localStorage on update
  useEffect(() => {
    try {
      localStorage.setItem('mb_clients', JSON.stringify(clients));
    } catch (e) {}
  }, [clients]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Login handler
  const handleLoginSuccess = (email: string, role: OfficerRole) => {
    const name = role === 'analyst' ? 'กิตติศักดิ์ ชัยมงคล (Analyst)' : 'สิริพร วงศ์สว่าง (Collector)';
    setCurrentUser({
      id: role === 'analyst' ? 'officer_02' : 'officer_01',
      name,
      email,
      role
    });
    setIsAuthenticated(true);
    setCurrentTab('user_list');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Switch role handler
  const handleSwitchOfficer = (role: OfficerRole) => {
    const name = role === 'analyst' ? 'กิตติศักดิ์ ชัยมงคล (Analyst)' : 'สิริพร วงศ์สว่าง (Collector)';
    const email = role === 'analyst' ? 'analyst@mindbooster.com' : 'collector@mindbooster.com';
    setCurrentUser({
      id: role === 'analyst' ? 'officer_02' : 'officer_01',
      name,
      email,
      role
    });
  };

  // Navigation tab select
  const handleSelectTab = (tab: string) => {
    if (tab === 'add_user') {
      const newClient: ClientProfile = {
        id: 'client_' + Date.now(),
        user_id_code: `MBT-${new Date().getFullYear()}-${String(clients.length + 1).padStart(4, '0')}`,
        status: 'created',
        first_name: '',
        last_name: '',
        nick_name: '',
        phone: '',
        email: '',
        citizen_id: '',
        parent_name: '',
        parent_phone: '',
        remark: '',
        birth_date: new Date().toISOString().slice(0, 10),
        gender: 'male',
        line_id: '',
        address: '',
        profile_image: '',
        assigned_collector: currentUser.name,
        assigned_analyst: 'กิตติศักดิ์ ชัยมงคล',
        created_at: new Date().toISOString(),
        latest_modified: new Date().toISOString()
      };
      setSelectedClient(newClient);
      setCurrentTab('add_user');
    } else {
      setCurrentTab(tab);
    }
  };

  // Add / Edit Client
  const handleEditClient = (client: ClientProfile) => {
    setSelectedClient(client);
    setCurrentTab('edit_user');
  };

  // View Report
  const handleViewReport = (client: ClientProfile) => {
    setSelectedClient(client);
    setCurrentTab('report');
  };

  // Save client changes
  const handleSaveClient = (updatedClient: ClientProfile) => {
    setClients(prev => {
      const exists = prev.find(c => c.id === updatedClient.id);
      if (exists) {
        return prev.map(c => c.id === updatedClient.id ? updatedClient : c);
      } else {
        return [updatedClient, ...prev];
      }
    });
    setSelectedClient(updatedClient);
  };

  // Delete client
  const handleDeleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
  };

  // Bulk action
  const handleBulkAction = (action: 'send_ai' | 'export_raw' | 'delete', selectedIds: string[]) => {
    if (action === 'delete') {
      if (confirm(`คุณต้องการลบข้อมูลที่เลือกทั้งหมด ${selectedIds.length} รายการ ใช่หรือไม่?`)) {
        setClients(prev => prev.filter(c => !selectedIds.includes(c.id)));
      }
    } else if (action === 'send_ai') {
      setClients(prev => prev.map(c => {
        if (selectedIds.includes(c.id)) {
          return { ...c, status: 'ai_processing', latest_modified: new Date().toISOString() };
        }
        return c;
      }));
      setTimeout(() => {
        setClients(prev => prev.map(c => {
          if (selectedIds.includes(c.id)) {
            return { ...c, status: 'ai_resulted', latest_modified: new Date().toISOString() };
          }
          return c;
        }));
        alert(`ส่งประมวลผล AI สำเร็จ ${selectedIds.length} รายการ`);
      }, 1500);
    } else if (action === 'export_raw') {
      alert(`ส่งออกข้อมูลดิบ (Raw Data) ${selectedIds.length} รายการ เรียบร้อยแล้ว`);
    }
  };

  // Sync to cloud simulation
  const handleSyncToCloud = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('ซิงค์ข้อมูล Client ทั้งหมดเข้าสู่ Cloud เรียบร้อยแล้ว');
    }, 1200);
  };

  // Import completion handler
  const handleImportComplete = (count: number) => {
    alert(`นำเข้าข้อมูลสำเร็จ ${count} รายการ!`);
  };

  // Render Login page if unauthenticated
  if (!isAuthenticated) {
    return (
      <SignIn
        onLoginSuccess={handleLoginSuccess}
        onForgotPassword={() => alert('กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน (admin@mindbooster.com)')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8F9] flex flex-col selection:bg-[#466BB2] selection:text-white">
      {/* Top Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onSwitchOfficer={handleSwitchOfficer}
        isOnline={isOnline}
        isLocalData={isLocalData}
        onToggleLocalData={setIsLocalData}
        localDataCount={clients.length}
        onLogout={handleLogout}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1">
        {/* 1. Client List View */}
        {currentTab === 'user_list' && (
          <Dashboard
            clients={clients}
            currentUser={currentUser}
            isLocalData={isLocalData}
            onToggleLocalData={setIsLocalData}
            onAddClient={() => handleSelectTab('add_user')}
            onEditClient={handleEditClient}
            onViewReport={handleViewReport}
            onDeleteClient={handleDeleteClient}
            onBulkAction={handleBulkAction}
            onImportData={() => setImportModalType('data')}
            onImportReport={() => setImportModalType('report')}
            onSyncToCloud={handleSyncToCloud}
            isSyncing={isSyncing}
          />
        )}

        {/* 2. Add / Edit Client Studio */}
        {(currentTab === 'add_user' || currentTab === 'edit_user') && selectedClient && (
          <FingerprintStudio
            client={selectedClient}
            currentUser={currentUser}
            onSave={handleSaveClient}
            onBack={() => setCurrentTab('user_list')}
            onGenerateReport={(updatedClient) => {
              handleSaveClient(updatedClient);
              handleViewReport(updatedClient);
            }}
          />
        )}

        {/* 3. Mind Booster Report View */}
        {currentTab === 'report' && selectedClient && (
          <ReportView
            client={selectedClient}
            onBack={() => setCurrentTab('user_list')}
          />
        )}

        {/* 4. Information Knowledge Base Views */}
        {currentTab.startsWith('info_') && (
          <InformationViews
            viewId={currentTab.replace('info_', '')}
            onBack={() => setCurrentTab('user_list')}
          />
        )}
      </main>

      {/* Import Modal */}
      <ImportModal
        type={importModalType || 'data'}
        isOpen={importModalType !== null}
        onClose={() => setImportModalType(null)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}
