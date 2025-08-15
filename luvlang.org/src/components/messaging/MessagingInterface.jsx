import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';
const MessagingInterface = () => {
    const { user } = useAuth();
    const { createOrGetConversation } = useConversations();
    const [selectedConversation, setSelectedConversation] = useState(null);
    const handleSelectConversation = async (conversationId, otherUserId) => {
        setSelectedConversation({ id: conversationId, otherUserId });
    };
    const startNewConversation = async (otherUserId) => {
        const conversation = await createOrGetConversation(otherUserId);
        if (conversation) {
            setSelectedConversation({
                id: conversation.id,
                otherUserId: conversation.participant_1 === user?.id
                    ? conversation.participant_2
                    : conversation.participant_1
            });
        }
    };
    if (!user) {
        return (<div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Please log in to access messaging</p>
      </div>);
    }
    return (<div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
      <div className="md:col-span-1">
        <ConversationsList onSelectConversation={handleSelectConversation} selectedConversationId={selectedConversation?.id}/>
      </div>
      <div className="md:col-span-2">
        <ChatWindow conversationId={selectedConversation?.id || null} otherUserId={selectedConversation?.otherUserId || null}/>
      </div>
    </div>);
};
export default MessagingInterface;
