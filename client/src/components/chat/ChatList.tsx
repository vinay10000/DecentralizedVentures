import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  getUserChatRooms, 
  ChatRoom,
  getMessages,
  ChatMessage
} from '@/firebase/database';
import { getUserData } from '@/firebase/auth';
import { User } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ChatListProps {
  onSelectChat: (userId: string, name: string, photo?: string) => void;
}

interface ChatRoomWithUser extends ChatRoom {
  otherUser: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
    unreadCount: number;
  };
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat }) => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoomWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        
        // Fetch user's chat rooms
        const rooms = await getUserChatRooms(user.uid);
        
        // Get other user info for each room
        const roomsWithUserInfo = await Promise.all(rooms.map(async (room) => {
          // Find the other user's ID
          const otherUserId = room.participants.find(id => id !== user.uid);
          
          if (!otherUserId) {
            throw new Error('Could not find other user in chat room');
          }
          
          // Get other user's info
          const otherUserInfo = await getUserData({ uid: otherUserId } as any);
          
          // Get messages to count unread
          const messages = await getMessages(room.id);
          const unreadCount = messages.filter(
            (msg) => msg.senderId === otherUserId && !msg.read
          ).length;
          
          return {
            ...room,
            otherUser: {
              uid: otherUserId,
              displayName: otherUserInfo?.displayName || 'Unknown User',
              photoURL: otherUserInfo?.photoURL,
              unreadCount
            }
          };
        }));
        
        setChatRooms(roomsWithUserInfo);
      } catch (err) {
        console.error('Error fetching chat rooms:', err);
        setError('Failed to load chats. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [user]);

  const handleSelectChat = (chatRoom: ChatRoomWithUser) => {
    onSelectChat(
      chatRoom.otherUser.uid,
      chatRoom.otherUser.displayName || 'Unknown User',
      chatRoom.otherUser.photoURL || undefined
    );
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show date without year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredChatRooms = chatRooms.filter(room => {
    const name = room.otherUser.displayName || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {filteredChatRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-gray-500">No conversations yet</p>
            <p className="text-sm text-gray-400">
              Start a conversation with a startup or investor
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChatRooms.map((room) => (
              <button
                key={room.id}
                className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors"
                onClick={() => handleSelectChat(room)}
              >
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={room.otherUser.photoURL || undefined} />
                  <AvatarFallback>{getInitials(room.otherUser.displayName)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between">
                    <h3 className="font-medium truncate">{room.otherUser.displayName}</h3>
                    {room.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(room.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500 truncate">
                      {room.lastMessage ? (
                        room.lastMessage.senderId === user?.uid ? (
                          <span>You: {room.lastMessage.text}</span>
                        ) : (
                          room.lastMessage.text
                        )
                      ) : (
                        'No messages yet'
                      )}
                    </p>
                    
                    {room.otherUser.unreadCount > 0 && (
                      <span className="flex-shrink-0 ml-2 h-5 w-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                        {room.otherUser.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ChatList;