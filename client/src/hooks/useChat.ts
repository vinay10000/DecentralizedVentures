import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  ChatMessage, 
  ChatRoom, 
  createChatRoom, 
  findChatRoom, 
  getUserChatRooms, 
  sendMessage as sendChatMessage,
  getMessages,
  subscribeToMessages,
  markMessagesAsRead as markAsRead
} from '../firebase/database';
import { getUserData } from '../firebase/auth';

interface UserChatRoom extends ChatRoom {
  recipientId: string;
  recipientName: string | null;
  recipientRole: 'investor' | 'startup' | null;
}

interface UseChatReturn {
  chatRooms: UserChatRoom[];
  currentRoom: UserChatRoom | null;
  messages: ChatMessage[];
  loadingRooms: boolean;
  loadingMessages: boolean;
  error: Error | null;
  sendMessage: (text: string) => Promise<void>;
  setCurrentRoom: (room: UserChatRoom) => void;
  createNewChat: (recipientId: string) => Promise<string>;
  markMessagesAsRead: () => Promise<void>;
}

export const useChat = (): UseChatReturn => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<UserChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<UserChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch chat rooms
  useEffect(() => {
    if (!user) return;

    const fetchChatRooms = async () => {
      try {
        setLoadingRooms(true);
        const rooms = await getUserChatRooms(user.uid);
        
        // Enhanced rooms with recipient info
        const enhancedRooms: UserChatRoom[] = await Promise.all(
          rooms.map(async (room) => {
            // Find the recipient (the other user in the chat)
            const recipientId = room.participants.find(id => id !== user.uid) || '';
            
            try {
              // Get recipient's user data from Firestore
              const recipientData = await getUserData({
                uid: recipientId
              } as any);
              
              return {
                ...room,
                recipientId,
                recipientName: recipientData?.displayName || null,
                recipientRole: recipientData?.role || null
              };
            } catch (err) {
              // If we can't get user data, still return the room with basic info
              return {
                ...room,
                recipientId,
                recipientName: null,
                recipientRole: null
              };
            }
          })
        );
        
        setChatRooms(enhancedRooms);
      } catch (err) {
        console.error('Error fetching chat rooms:', err);
        setError(err instanceof Error ? err : new Error('Failed to load chat rooms'));
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchChatRooms();
  }, [user]);

  // Subscribe to messages when current room changes
  useEffect(() => {
    if (!currentRoom || !user) return;

    setLoadingMessages(true);
    
    const unsubscribe = subscribeToMessages(currentRoom.id, (newMessages) => {
      setMessages(newMessages);
      setLoadingMessages(false);
    });

    // Mark messages as read when entering a room
    markAsRead(currentRoom.id, user.uid).catch(err => {
      console.error('Error marking messages as read:', err);
    });

    return () => {
      unsubscribe();
    };
  }, [currentRoom, user]);

  // Send message
  const sendMessage = async (text: string) => {
    if (!currentRoom || !user || !text.trim()) return;

    try {
      await sendChatMessage(currentRoom.id, {
        senderId: user.uid,
        senderName: user.displayName || 'Unknown',
        recipientId: currentRoom.recipientId,
        message: text.trim(),
        timestamp: Date.now(),
        read: false
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err : new Error('Failed to send message'));
    }
  };

  // Create a new chat
  const createNewChat = async (recipientId: string) => {
    if (!user) throw new Error('User not authenticated');
    if (user.uid === recipientId) throw new Error('Cannot chat with yourself');

    try {
      // Check if a chat already exists
      const existingRoomId = await findChatRoom(user.uid, recipientId);
      
      if (existingRoomId) {
        // Find the room in our local state
        const room = chatRooms.find(r => r.id === existingRoomId);
        if (room) setCurrentRoom(room);
        return existingRoomId;
      }
      
      // Create a new chat room
      const newRoomId = await createChatRoom(user.uid, recipientId);
      
      // Get recipient data
      const recipientData = await getUserData({
        uid: recipientId
      } as any);
      
      // Create a new room object
      const newRoom: UserChatRoom = {
        id: newRoomId,
        participants: [user.uid, recipientId],
        createdAt: Date.now(),
        recipientId: recipientId,
        recipientName: recipientData?.displayName || null,
        recipientRole: recipientData?.role || null
      };
      
      // Add to local state
      setChatRooms(prev => [newRoom, ...prev]);
      setCurrentRoom(newRoom);
      
      return newRoomId;
    } catch (err) {
      console.error('Error creating chat:', err);
      throw err;
    }
  };

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!currentRoom || !user) return;
    
    try {
      await markAsRead(currentRoom.id, user.uid);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [currentRoom, user]);

  return {
    chatRooms,
    currentRoom,
    messages,
    loadingRooms,
    loadingMessages,
    error,
    sendMessage,
    setCurrentRoom,
    createNewChat,
    markMessagesAsRead
  };
};

// Helper hook to navigate to a chat
export const useNavigateToChat = () => {
  const { createNewChat, setCurrentRoom } = useChat();
  
  const navigate = async (recipientId: string, recipientName: string) => {
    try {
      await createNewChat(recipientId);
      // Note: We don't need to explicitly navigate here as the createNewChat function
      // sets the current room, which should trigger UI updates
    } catch (err) {
      console.error('Error navigating to chat:', err);
    }
  };
  
  return navigate;
};
