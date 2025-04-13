import { 
  ref, 
  set, 
  push, 
  get, 
  query, 
  orderByChild, 
  equalTo,
  onValue,
  update,
  serverTimestamp
} from 'firebase/database';
import { database } from './config';

// Chat message interface
export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// Chat room interface
export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    timestamp: number;
    senderId: string;
  };
  createdAt: number;
}

/**
 * Create a new chat room between two users
 */
export const createChatRoom = async (user1Id: string, user2Id: string): Promise<string> => {
  try {
    const roomRef = push(ref(database, 'chatRooms'));
    const roomId = roomRef.key;
    
    if (!roomId) {
      throw new Error('Failed to generate chat room ID');
    }
    
    const roomData = {
      participants: [user1Id, user2Id],
      createdAt: Date.now()
    };
    
    await set(roomRef, roomData);
    
    // Add room to user's chat rooms list
    await set(ref(database, `userChatRooms/${user1Id}/${roomId}`), true);
    await set(ref(database, `userChatRooms/${user2Id}/${roomId}`), true);
    
    return roomId;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
};

/**
 * Find an existing chat room between two users
 */
export const findChatRoom = async (user1Id: string, user2Id: string): Promise<string | null> => {
  try {
    // Get user's chat rooms
    const userRoomsSnapshot = await get(ref(database, `userChatRooms/${user1Id}`));
    
    if (!userRoomsSnapshot.exists()) {
      return null;
    }
    
    const userRooms: Record<string, boolean> = userRoomsSnapshot.val();
    
    // Check each room to see if the other user is a participant
    for (const roomId of Object.keys(userRooms)) {
      const roomSnapshot = await get(ref(database, `chatRooms/${roomId}`));
      
      if (roomSnapshot.exists()) {
        const room = roomSnapshot.val();
        if (room.participants && room.participants.includes(user2Id)) {
          return roomId;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding chat room:', error);
    throw error;
  }
};

/**
 * Send a message in a chat room
 */
export const sendMessage = async (roomId: string, message: Omit<ChatMessage, 'id'>): Promise<string> => {
  try {
    const messageRef = push(ref(database, `messages/${roomId}`));
    const messageId = messageRef.key;
    
    if (!messageId) {
      throw new Error('Failed to generate message ID');
    }
    
    const messageData = {
      ...message,
      id: messageId
    };
    
    await set(messageRef, messageData);
    
    // Update last message in chat room
    await update(ref(database, `chatRooms/${roomId}`), {
      lastMessage: {
        text: message.message,
        timestamp: message.timestamp,
        senderId: message.senderId
      }
    });
    
    return messageId;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get all messages in a chat room
 */
export const getMessages = async (roomId: string): Promise<ChatMessage[]> => {
  try {
    const messagesSnapshot = await get(ref(database, `messages/${roomId}`));
    
    if (!messagesSnapshot.exists()) {
      return [];
    }
    
    const messagesData: Record<string, any> = messagesSnapshot.val();
    
    return Object.keys(messagesData).map(key => ({
      id: key,
      ...messagesData[key]
    })).sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

/**
 * Get all chat rooms for a user
 */
export const getUserChatRooms = async (userId: string): Promise<ChatRoom[]> => {
  try {
    const userRoomsSnapshot = await get(ref(database, `userChatRooms/${userId}`));
    
    if (!userRoomsSnapshot.exists()) {
      return [];
    }
    
    const userRooms: Record<string, boolean> = userRoomsSnapshot.val();
    const chatRooms: ChatRoom[] = [];
    
    // Fetch each chat room
    for (const roomId of Object.keys(userRooms)) {
      const roomSnapshot = await get(ref(database, `chatRooms/${roomId}`));
      
      if (roomSnapshot.exists()) {
        const room = roomSnapshot.val();
        chatRooms.push({
          id: roomId,
          participants: room.participants,
          lastMessage: room.lastMessage,
          createdAt: room.createdAt
        });
      }
    }
    
    // Sort by last message timestamp (newest first)
    return chatRooms.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp || a.createdAt;
      const timeB = b.lastMessage?.timestamp || b.createdAt;
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Error getting user chat rooms:', error);
    throw error;
  }
};

/**
 * Subscribe to messages in a chat room
 */
export const subscribeToMessages = (roomId: string, callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = ref(database, `messages/${roomId}`);
  
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const messagesData: Record<string, any> = snapshot.val();
    
    const messages = Object.keys(messagesData).map(key => ({
      id: key,
      ...messagesData[key]
    })).sort((a, b) => a.timestamp - b.timestamp);
    
    callback(messages);
  });
  
  return unsubscribe;
};

/**
 * Mark messages as read in a chat room
 */
export const markMessagesAsRead = async (roomId: string, userId: string) => {
  try {
    const messagesSnapshot = await get(ref(database, `messages/${roomId}`));
    
    if (!messagesSnapshot.exists()) {
      return;
    }
    
    const messagesData: Record<string, any> = messagesSnapshot.val();
    const updates: Record<string, any> = {};
    
    // Find messages to mark as read
    Object.keys(messagesData).forEach(key => {
      const message = messagesData[key];
      if (message.recipientId === userId && !message.read) {
        updates[`messages/${roomId}/${key}/read`] = true;
      }
    });
    
    // Apply updates if there are any
    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};