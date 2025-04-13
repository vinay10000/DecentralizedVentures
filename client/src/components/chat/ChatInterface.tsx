import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  createChatRoom, 
  findChatRoom, 
  sendMessage, 
  subscribeToMessages, 
  markMessagesAsRead,
  ChatMessage
} from '@/firebase/database';

interface ChatInterfaceProps {
  recipientId: string;
  recipientName: string;
  recipientPhoto?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  recipientId, 
  recipientName,
  recipientPhoto 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat room
  useEffect(() => {
    const initializeChat = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        
        // Find existing chat room or create new one
        let chatRoomId = await findChatRoom(user.uid, recipientId);
        
        if (!chatRoomId) {
          chatRoomId = await createChatRoom(user.uid, recipientId);
        }
        
        setRoomId(chatRoomId);
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to initialize chat. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [user, recipientId]);

  // Subscribe to messages
  useEffect(() => {
    if (!roomId || !user) return;

    const unsubscribe = subscribeToMessages(roomId, (newMessages) => {
      setMessages(newMessages);
      // Mark messages as read
      markMessagesAsRead(roomId, user.uid).catch(err => {
        console.error('Error marking messages as read:', err);
      });
    });

    return () => unsubscribe();
  }, [roomId, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !roomId || !user) return;

    try {
      await sendMessage(roomId, {
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        recipientId,
        message: newMessage.trim(),
        timestamp: Date.now(),
        read: false
      });
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <Avatar className="h-10 w-10">
          {recipientPhoto ? (
            <AvatarImage src={recipientPhoto} alt={recipientName} />
          ) : (
            <AvatarFallback>{getInitials(recipientName)}</AvatarFallback>
          )}
        </Avatar>
        <div className="ml-3">
          <h3 className="font-medium">{recipientName}</h3>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet</p>
              <p className="text-sm">Send a message to start the conversation</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.senderId === user?.uid;
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      isCurrentUser 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <div 
                      className={`text-xs mt-1 ${
                        isCurrentUser 
                          ? 'text-primary-foreground/80' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;