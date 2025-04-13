import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ChatList from '@/components/chat/ChatList';
import ChatInterface from '@/components/chat/ChatInterface';
import { Separator } from '@/components/ui/separator';
import { MessageSquare } from 'lucide-react';

const MessagesPage = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<{
    userId: string;
    name: string;
    photo?: string;
  } | null>(null);

  const handleSelectChat = (userId: string, name: string, photo?: string) => {
    setSelectedChat({ userId, name, photo });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please sign in to access messages</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full">
        {/* Chat list sidebar */}
        <div className="border rounded-md overflow-hidden h-full md:col-span-1">
          <ChatList onSelectChat={handleSelectChat} />
        </div>

        {/* Chat content */}
        <div className="border rounded-md overflow-hidden h-full md:col-span-2 lg:col-span-3">
          {selectedChat ? (
            <ChatInterface
              recipientId={selectedChat.userId}
              recipientName={selectedChat.name}
              recipientPhoto={selectedChat.photo}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Your Messages</h3>
              <p className="text-gray-500 max-w-md mt-2">
                Select a conversation from the sidebar or start a new one by finding a startup or investor to connect with.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;