import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MessageList from './MessageList';
import { Send, ArrowLeft } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatInterfaceProps {
  backButton?: boolean;
  onBack?: () => void;
}

const ChatInterface = ({ backButton = false, onBack }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const { 
    chatRooms, 
    currentRoom, 
    messages, 
    sendMessage, 
    setCurrentRoom, 
    loadingRooms, 
    loadingMessages,
    markMessagesAsRead
  } = useChat();
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Mark messages as read when changing rooms
  useEffect(() => {
    if (currentRoom && user) {
      markMessagesAsRead();
    }
  }, [currentRoom, user, markMessagesAsRead]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentRoom || !user) return;
    
    await sendMessage(newMessage);
    setNewMessage('');
  };
  
  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  // Format date for chat room listing
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString();
  };
  
  // Check if room has unread messages
  const hasUnreadMessages = (room: any) => {
    if (!user) return false;
    
    return room.lastMessage && 
      room.lastMessage.senderId !== user.uid && 
      !room.lastMessage.read;
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          {backButton && (
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <CardTitle>Messages</CardTitle>
        </div>
        <CardDescription>
          Chat with startup founders or investors
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <Tabs defaultValue="chat" className="flex flex-col h-full">
          <TabsList className="mx-6">
            <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
            <TabsTrigger value="rooms" className="flex-1">Conversations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col data-[state=inactive]:hidden h-full">
            {!currentRoom ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Select a conversation to start chatting
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => document.querySelector('[data-value="rooms"]')?.click()}
                  >
                    View Conversations
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt="Contact" />
                      <AvatarFallback>
                        {currentRoom.recipientName ? getInitials(currentRoom.recipientName) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{currentRoom.recipientName || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currentRoom.recipientRole === 'investor' ? 'Investor' : 'Startup Founder'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[75%] ${i % 2 === 0 ? 'bg-gray-100 dark:bg-gray-800' : 'bg-primary-100 dark:bg-primary-900'} rounded-lg p-3`}>
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    ))
                  ) : messages.length > 0 ? (
                    <MessageList messages={messages} currentUserId={user?.uid || ''} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="rooms" className="flex-1 data-[state=inactive]:hidden overflow-y-auto">
            {loadingRooms ? (
              <div className="p-4 space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center p-3 border-b">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="ml-3 flex-1">
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                    <Skeleton className="h-3 w-10" />
                  </div>
                ))}
              </div>
            ) : chatRooms.length > 0 ? (
              <div className="divide-y">
                {chatRooms.map((room) => (
                  <div 
                    key={room.id}
                    className={`flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer
                      ${currentRoom?.id === room.id ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                    onClick={() => setCurrentRoom(room)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={room.recipientName || 'Contact'} />
                      <AvatarFallback>
                        {room.recipientName ? getInitials(room.recipientName) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium truncate">{room.recipientName || 'Unknown'}</p>
                        {room.lastMessage && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(room.lastMessage.timestamp)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
                          {room.lastMessage ? room.lastMessage.text : 'No messages yet'}
                        </p>
                        {hasUnreadMessages(room) && (
                          <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-6">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    No conversations yet
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Start chatting with startups or investors from their profiles
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
