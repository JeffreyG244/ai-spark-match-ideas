
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TestMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  status: 'sent' | 'delivered' | 'failed';
}

const MessagingTest = () => {
  const { user } = useAuth();
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadTestData();
    }
  }, [user]);

  const loadTestData = async () => {
    try {
      // Get conversation count
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user?.id},participant_2.eq.${user?.id}`);

      if (!convError) {
        setConversationCount(conversations?.length || 0);
      }

      // Load recent messages
      const { data: messages, error: msgError } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('sender_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!msgError && messages) {
        const testMsgs = messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender_id: msg.sender_id,
          created_at: msg.created_at,
          status: 'sent' as const
        }));
        setTestMessages(testMsgs);
      }
    } catch (error) {
      console.error('Error loading test data:', error);
    }
  };

  const sendTestMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      // Create a test conversation if none exists
      let testConversationId = null;
      
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user?.id},participant_2.eq.${user?.id}`)
        .limit(1)
        .maybeSingle();

      if (existingConv) {
        testConversationId = existingConv.id;
      } else {
        // Create a test conversation with self (for testing purposes)
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            participant_1: user?.id,
            participant_2: user?.id // Self-conversation for testing
          })
          .select()
          .single();

        if (convError) {
          throw convError;
        }
        testConversationId = newConv.id;
      }

      // Send the test message
      const { data: message, error: msgError } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: testConversationId,
          sender_id: user?.id,
          content: newMessage,
          message_type: 'text'
        })
        .select()
        .single();

      if (msgError) {
        throw msgError;
      }

      const testMsg: TestMessage = {
        id: message.id,
        content: message.content,
        sender_id: message.sender_id,
        created_at: message.created_at,
        status: 'sent'
      };

      setTestMessages(prev => [testMsg, ...prev.slice(0, 4)]);
      setNewMessage('');
      
      toast({
        title: '✅ Message Sent Successfully',
        description: 'Test message delivered to the messaging system',
      });

    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: 'Message Failed',
        description: 'Failed to send test message. Check console for details.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const testRealTimeConnection = async () => {
    try {
      // Test real-time connection
      const channel = supabase
        .channel('messaging-test')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages'
        }, (payload) => {
          console.log('Real-time message received:', payload);
          toast({
            title: '🔔 Real-time Working',
            description: 'Message received via real-time connection',
          });
        })
        .subscribe();

      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 5000);

      toast({
        title: 'Real-time Test Started',
        description: 'Listening for real-time messages for 5 seconds...',
      });
    } catch (error) {
      console.error('Real-time test error:', error);
      toast({
        title: 'Real-time Test Failed',
        description: 'Could not establish real-time connection',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Messaging System Test
        </CardTitle>
        <p className="text-sm text-gray-600">Test messaging functionality before going live</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{conversationCount}</div>
            <div className="text-sm text-gray-600">Active Conversations</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{testMessages.length}</div>
            <div className="text-sm text-gray-600">Test Messages</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {testMessages.filter(m => m.status === 'sent').length}
            </div>
            <div className="text-sm text-gray-600">Successful Sends</div>
          </div>
        </div>

        {/* Send Test Message */}
        <div className="space-y-3">
          <h4 className="font-medium">Send Test Message</h4>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Enter test message..."
              onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
            />
            <Button 
              onClick={sendTestMessage}
              disabled={loading || !newMessage.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>

        {/* Real-time Test */}
        <div className="space-y-3">
          <h4 className="font-medium">Real-time Connection Test</h4>
          <Button 
            onClick={testRealTimeConnection}
            variant="outline"
            className="w-full"
          >
            Test Real-time Messaging
          </Button>
        </div>

        {/* Recent Test Messages */}
        <div className="space-y-3">
          <h4 className="font-medium">Recent Test Messages</h4>
          {testMessages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No test messages yet</p>
          ) : (
            <div className="space-y-2">
              {testMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm">{msg.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </span>
                      <Badge 
                        className={msg.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {msg.status === 'sent' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {msg.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagingTest;
