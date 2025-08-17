
import React from 'react';
import { 
  Heart, Shield, Crown, MessageCircle, ArrowLeft, Settings, Filter, 
  Search, Bell, Plus, Verified 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EnhancedExecutiveMessaging from '@/components/messaging/EnhancedExecutiveMessaging';
import Logo from '@/components/ui/logo';

const Messages: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 rounded-xl p-3 hover:bg-slate-700/50 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <Logo size="lg" showText={false} />
              <div>
                <h1 className="text-3xl font-bold text-white">Messages</h1>
                <p className="text-purple-300 text-sm">Your conversations & connections</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">
                <Plus className="w-5 h-5 inline mr-2" />
                New Message
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6">
          <EnhancedExecutiveMessaging />
        </div>
      </main>
    </div>
  );
};

export default Messages;
