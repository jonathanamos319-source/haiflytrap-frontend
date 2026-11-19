import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { User, LogOut, Trash2, ShieldAlert, Package, ChevronRight, X, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

export function SettingsPage() {
  const { logout, setCurrentView, user, isLoadingUser } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const displayName = user?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Customer';
  const displayEmail = user?.email || 'Manage your account preferences';

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await api.delete('/auth/me');
      if (res.data?.success) {
        logout();
      } else {
        setErrorModal(res.data?.error || 'Failed to delete account. Please try again later.');
        setShowDeleteConfirm(false);
      }
    } catch (e: any) {
      console.error(e);
      setErrorModal(e.response?.data?.error || 'An error occurred while deleting your account.');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] pt-12 pb-24 px-4 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'customer') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] pt-16 pb-24 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-sm border border-outline-variant">
          <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center text-forest mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-forest mb-2">Customer Account</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Please sign in to your customer account to view your recent orders and manage your preferences.
          </p>
          <button
            onClick={() => setCurrentView('customer-login')}
            className="w-full py-3.5 bg-forest text-white font-bold rounded-2xl hover:bg-forest/90 transition-colors btn-anim"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-12 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-forest mb-8">Account Settings</h1>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant mb-8">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-outline-variant">
            <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center text-forest">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-forest capitalize">{displayName}</h2>
              <p className="text-muted-foreground text-sm">{displayEmail}</p>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => setCurrentView('recent-orders')}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-surface-high transition-colors group"
            >
              <div className="flex items-center gap-3 text-forest font-medium">
                <Package className="w-5 h-5 text-forest/60 group-hover:text-forest transition-colors" />
                Recent Orders
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-forest group-hover:translate-x-1 transition-all" />
            </button>

            <button 
              onClick={() => logout()}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-surface-high transition-colors group"
            >
              <div className="flex items-center gap-3 text-forest font-medium">
                <LogOut className="w-5 h-5 text-forest/60 group-hover:text-forest transition-colors" />
                Sign Out
              </div>
            </button>

            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-50 transition-colors group border border-transparent hover:border-red-100 mt-8"
            >
              <div className="flex items-center gap-3 text-red-600 font-medium">
                <Trash2 className="w-5 h-5" />
                Delete Account
              </div>
            </button>
          </div>
        </div>

        <div className="bg-surface-high rounded-2xl p-6 flex gap-4">
          <ShieldAlert className="w-6 h-6 text-gold shrink-0" />
          <p className="text-sm text-muted-foreground">
            Deleting your account will permanently remove all your data, order history, and preferences. This action cannot be reversed.
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-6 mx-auto">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Delete Account?</h3>
            <p className="text-center text-slate-500 text-sm mb-8 leading-relaxed">
              Are you completely sure? This will instantly delete your profile, wipe your order history, and remove all your data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-3.5 px-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-3.5 px-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <button 
                onClick={() => setErrorModal('')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Action Failed</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              {errorModal}
            </p>
            <button
              onClick={() => setErrorModal('')}
              className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
