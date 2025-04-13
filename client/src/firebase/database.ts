import { ref, set, push, get, remove, onValue, off, query, orderByChild } from "firebase/database";
import { database } from "./config";

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  message: string;
  timestamp: number;
  read: boolean;
}

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

// Create a new chat room between two users
export const createChatRoom = async (user1Id: string, user2Id: string): Promise<string> => {
  try {
    // Check if a chat room already exists between these users
    const existingRoom = await findChatRoom(user1Id, user2Id);
    
    if (existingRoom) {
      return existingRoom;
    }
    
    // Create a new chat room
    const chatRoomsRef = ref(database, 'chatRooms');
    const newRoomRef = push(chatRoomsRef);
    const roomId = newRoomRef.key as string;
    
    const participants = [user1Id, user2Id];
    const now = Date.now();
    
    await set(newRoomRef, {
      participants,
      createdAt: now
    });
    
    // Add this room to each user's chat rooms list
    for (const userId of participants) {
      await set(ref(database, `userChatRooms/${userId}/${roomId}`), true);
    }
    
    return roomId;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
};

// Find an existing chat room between two users
export const findChatRoom = async (user1Id: string, user2Id: string): Promise<string | null> => {
  try {
    // Get user1's chat rooms
    const user1RoomsRef = ref(database, `userChatRooms/${user1Id}`);
    const user1RoomsSnapshot = await get(user1RoomsRef);
    
    if (!user1RoomsSnapshot.exists()) {
      return null;
    }
    
    const user1Rooms = Object.keys(user1RoomsSnapshot.val());
    
    // For each room, check if user2 is a participant
    for (const roomId of user1Rooms) {
      const roomRef = ref(database, `chatRooms/${roomId}`);
      const roomSnapshot = await get(roomRef);
      
      if (roomSnapshot.exists()) {
        const room = roomSnapshot.val();
        if (room.participants.includes(user2Id)) {
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

// Send a message in a chat room
export const sendMessage = async (roomId: string, message: Omit<ChatMessage, 'id'>): Promise<string> => {
  try {
    const messagesRef = ref(database, `messages/${roomId}`);
    const newMessageRef = push(messagesRef);
    const messageId = newMessageRef.key as string;
    
    await set(newMessageRef, message);
    
    // Update the last message in the chat room
    await set(ref(database, `chatRooms/${roomId}/lastMessage`), {
      text: message.message,
      timestamp: message.timestamp,
      senderId: message.senderId
    });
    
    return messageId;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get all messages in a chat room
export const getMessages = async (roomId: string): Promise<ChatMessage[]> => {
  try {
    const messagesRef = ref(database, `messages/${roomId}`);
    const messagesSnapshot = await get(messagesRef);
    
    if (!messagesSnapshot.exists()) {
      return [];
    }
    
    const messagesObj = messagesSnapshot.val();
    const messages: ChatMessage[] = [];
    
    for (const messageId in messagesObj) {
      messages.push({
        id: messageId,
        ...messagesObj[messageId]
      });
    }
    
    // Sort messages by timestamp
    messages.sort((a, b) => a.timestamp - b.timestamp);
    
    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

// Get all chat rooms for a user
export const getUserChatRooms = async (userId: string): Promise<ChatRoom[]> => {
  try {
    const userRoomsRef = ref(database, `userChatRooms/${userId}`);
    const userRoomsSnapshot = await get(userRoomsRef);
    
    if (!userRoomsSnapshot.exists()) {
      return [];
    }
    
    const userRoomsObj = userRoomsSnapshot.val();
    const roomIds = Object.keys(userRoomsObj);
    const rooms: ChatRoom[] = [];
    
    for (const roomId of roomIds) {
      const roomRef = ref(database, `chatRooms/${roomId}`);
      const roomSnapshot = await get(roomRef);
      
      if (roomSnapshot.exists()) {
        const roomData = roomSnapshot.val();
        rooms.push({
          id: roomId,
          ...roomData
        });
      }
    }
    
    // Sort rooms by last message timestamp (most recent first)
    rooms.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp || a.createdAt;
      const timeB = b.lastMessage?.timestamp || b.createdAt;
      return timeB - timeA;
    });
    
    return rooms;
  } catch (error) {
    console.error('Error getting user chat rooms:', error);
    throw error;
  }
};

// Subscribe to new messages in a chat room
export const subscribeToMessages = (roomId: string, callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = ref(database, `messages/${roomId}`);
  
  onValue(messagesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const messagesObj = snapshot.val();
    const messages: ChatMessage[] = [];
    
    for (const messageId in messagesObj) {
      messages.push({
        id: messageId,
        ...messagesObj[messageId]
      });
    }
    
    // Sort messages by timestamp
    messages.sort((a, b) => a.timestamp - b.timestamp);
    
    callback(messages);
  });
  
  // Return a function to unsubscribe
  return () => off(messagesRef);
};

// Mark messages as read
export const markMessagesAsRead = async (roomId: string, userId: string) => {
  try {
    const messagesRef = ref(database, `messages/${roomId}`);
    const messagesSnapshot = await get(messagesRef);
    
    if (!messagesSnapshot.exists()) {
      return;
    }
    
    const messagesObj = messagesSnapshot.val();
    
    for (const messageId in messagesObj) {
      const message = messagesObj[messageId];
      
      // Only mark messages sent to this user as read
      if (message.recipientId === userId && !message.read) {
        await set(ref(database, `messages/${roomId}/${messageId}/read`), true);
      }
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};
