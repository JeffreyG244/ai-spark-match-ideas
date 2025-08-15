import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Circle } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';
import { usePresence } from '@/hooks/usePresence';
const ConversationsList = ({ onSelectConversation, selectedConversationId }) => {
    const { conversations, isLoading } = useConversations();
    const { isUserOnline } = usePresence();
    if (isLoading) {
        return (<Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5"/>
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (<div key={i} className="h-12 bg-gray-200 rounded"></div>))}
          </div>
        </CardContent>
      </Card>);
    }
    return (<Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5"/>
          Conversations ({conversations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {conversations.length === 0 ? (<p className="text-gray-500 text-center py-4">
            No conversations yet. Start chatting with other members!
          </p>) : (conversations.map((conversation) => (<Button key={conversation.id} variant={selectedConversationId === conversation.id ? "default" : "outline"} className="w-full justify-start h-auto p-3" onClick={() => onSelectConversation(conversation.id, conversation.other_participant)}>
              <div className="flex items-center gap-3 w-full">
                <div className="relative">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">
                      {conversation.other_participant?.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <Circle className={`absolute -bottom-1 -right-1 h-3 w-3 ${isUserOnline(conversation.other_participant)
                ? 'text-green-500 fill-green-500'
                : 'text-gray-400 fill-gray-400'}`}/>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">
                    User {conversation.other_participant?.slice(0, 8)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isUserOnline(conversation.other_participant) ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            </Button>)))}
      </CardContent>
    </Card>);
};
export default ConversationsList;
