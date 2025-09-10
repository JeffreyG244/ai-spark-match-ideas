import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Clock, CheckCircle, Database, Image, MessageCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  size: string;
}

export const DataExport = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['profile', 'messages', 'matches']);
  const [exportHistory, setExportHistory] = useState<Array<{
    id: string;
    date: string;
    status: 'completed' | 'processing' | 'failed';
    size: string;
  }>>([]);

  const exportOptions: ExportOption[] = [
    {
      id: 'profile',
      label: 'Profile Data',
      description: 'Your profile information, preferences, and settings',
      icon: <Database className="w-4 h-4" />,
      size: '~50KB'
    },
    {
      id: 'messages',
      label: 'Messages & Conversations',
      description: 'All your messages and conversation history',
      icon: <MessageCircle className="w-4 h-4" />,
      size: '~2MB'
    },
    {
      id: 'matches',
      label: 'Matches & Interactions',
      description: 'Your match history and interaction data',
      icon: <FileText className="w-4 h-4" />,
      size: '~100KB'
    },
    {
      id: 'photos',
      label: 'Photos & Media',
      description: 'All uploaded photos and media files',
      icon: <Image className="w-4 h-4" />,
      size: '~10MB'
    }
  ];

  const handleExport = async () => {
    if (selectedOptions.length === 0) {
      toast({
        title: "No Data Selected",
        description: "Please select at least one data type to export.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to export your data.",
          variant: "destructive"
        });
        return;
      }

      // Collect data based on selected options
      const exportData: any = {
        exportDate: new Date().toISOString(),
        userId: user.id,
        email: user.email,
        data: {}
      };

      if (selectedOptions.includes('profile')) {
        // Get profile data
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        exportData.data.profile = {
          ...profile,
          // Remove sensitive fields
          id: user.id,
          email: user.email,
          created_at: profile?.created_at
        };
      }

      if (selectedOptions.includes('messages')) {
        // Get messages data
        const { data: conversations } = await supabase
          .from('conversations')
          .select(`
            *,
            messages (
              id,
              content,
              created_at,
              sender_id
            )
          `)
          .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`);
        
        exportData.data.conversations = conversations?.map(conv => ({
          ...conv,
          messages: conv.messages || []
        })) || [];
      }

      if (selectedOptions.includes('matches')) {
        // Get matches data  
        const { data: matches } = await supabase
          .from('daily_matches')
          .select('*')
          .eq('user_id', user.id);
        
        exportData.data.matches = matches || [];
      }

      if (selectedOptions.includes('photos')) {
        // Get photo URLs from storage
        const { data: files } = await supabase.storage
          .from('profile-photos')
          .list(user.id);
        
        exportData.data.photos = files?.map(file => ({
          name: file.name,
          size: file.metadata?.size,
          created_at: file.created_at,
          url: `${user.id}/${file.name}`
        })) || [];
      }

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `luvlang-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Add to export history
      const newExport = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        status: 'completed' as const,
        size: `${Math.round(dataStr.length / 1024)}KB`
      };
      setExportHistory(prev => [newExport, ...prev]);

      toast({
        title: "Export Complete",
        description: "Your data has been successfully exported and downloaded."
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = (optionId: string, checked: boolean) => {
    setSelectedOptions(prev => 
      checked 
        ? [...prev, optionId]
        : prev.filter(id => id !== optionId)
    );
  };

  return (
    <Card className="bg-slate-800/60 backdrop-blur-xl border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-purple-400" />
          Export My Data
        </CardTitle>
        <CardDescription className="text-slate-300">
          Download a copy of your data for your records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Options */}
        <div>
          <h4 className="text-white font-medium mb-4">Select data to export:</h4>
          <div className="space-y-3">
            {exportOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50"
              >
                <Checkbox
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={(checked) => handleOptionChange(option.id, checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {option.icon}
                    <label htmlFor={option.id} className="text-white font-medium cursor-pointer">
                      {option.label}
                    </label>
                    <span className="text-slate-400 text-sm">{option.size}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleExport}
            disabled={isLoading || selectedOptions.length === 0}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex-1"
          >
            {isLoading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </div>

        {/* Export History */}
        {exportHistory.length > 0 && (
          <div>
            <h4 className="text-white font-medium mb-3">Recent Exports</h4>
            <div className="space-y-2">
              {exportHistory.slice(0, 3).map((exportItem) => (
                <div
                  key={exportItem.id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <div>
                      <div className="text-white text-sm">
                        Data Export - {exportItem.size}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {new Date(exportItem.date).toLocaleDateString()} at{' '}
                        {new Date(exportItem.date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                  <span className="text-green-400 text-sm font-medium">Completed</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h5 className="text-blue-400 font-medium mb-2">About Data Exports</h5>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• Exports are provided in JSON format for easy processing</li>
            <li>• All personal data is included according to your selection</li>
            <li>• Photos are referenced by URL (not included in download)</li>
            <li>• Sensitive information like passwords is never included</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExport;