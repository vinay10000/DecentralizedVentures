import { ChatMessage } from '@/firebase/database';
import { useRef, useEffect } from 'react';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
}

const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Group messages by date
  const groupedMessages: { [key: string]: ChatMessage[] } = {};
  
  messages.forEach((message) => {
    const date = new Date(message.timestamp);
    const dateKey = date.toLocaleDateString();
    
    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = [];
    }
    
    groupedMessages[dateKey].push(message);
  });
  
  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Format date for header
  const formatDateHeader = (dateStr: string) => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    
    if (dateStr === today) {
      return 'Today';
    } else if (dateStr === yesterday) {
      return 'Yesterday';
    }
    
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="space-y-6">
      {Object.keys(groupedMessages).map((dateKey) => (
        <div key={dateKey} className="space-y-4">
          <div className="flex justify-center">
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
              {formatDateHeader(dateKey)}
            </span>
          </div>
          
          {groupedMessages[dateKey].map((message, idx) => {
            const isCurrentUser = message.senderId === currentUserId;
            const showSenderName = !isCurrentUser && 
              (idx === 0 || groupedMessages[dateKey][idx - 1].senderId !== message.senderId);
            
            return (
              <div 
                key={message.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    isCurrentUser 
                      ? 'bg-primary-500 text-primary-foreground' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {showSenderName && (
                    <div className="text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">
                      {message.senderName}
                    </div>
                  )}
                  <p className="text-sm">{message.message}</p>
                  <div 
                    className={`text-xs mt-1 ${
                      isCurrentUser 
                        ? 'text-primary-foreground/70' 
                        : 'text-gray-500 dark:text-gray-400'
                    } flex items-center justify-end`}
                  >
                    {formatTime(message.timestamp)}
                    {isCurrentUser && (
                      <span className="ml-1">
                        {message.read ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L7 17l-5-5"></path>
                            <path d="M22 6L11 17l-5-5"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12l5 5L20 7"></path>
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
