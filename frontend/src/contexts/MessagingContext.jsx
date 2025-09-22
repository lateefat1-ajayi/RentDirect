import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useSocket from '../hooks/useSocket';
import { sendMessageSocket, joinRoom, ensureSocketAuth } from '../services/socket';
import { apiFetch } from '../lib/api';
import { toast } from 'react-toastify';

const MessagingContext = createContext();

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

export const MessagingProvider = ({ children, userRole, profile, initialConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(initialConversationId || null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [partnerTypingByConv, setPartnerTypingByConv] = useState({});

  // Debug logging
  useEffect(() => {
    console.log("MessagingContext - Profile data:", {
      profileId: profile?._id,
      profileRole: profile?.role,
      profileEmail: profile?.email,
      profileName: profile?.name,
      userRole
    });
  }, [profile, userRole]);

  // Fetch conversations based on user role
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if profile is available
      if (!profile?._id || !profile?.role) {
        console.log("MessagingContext - Cannot fetch conversations: profile not available");
        return;
      }
      
      ensureSocketAuth();
      
      const endpoint = userRole === 'landlord' ? '/conversations?role=landlord' : '/conversations?role=tenant';
      console.log("MessagingContext - Fetching conversations from:", endpoint);
      
      const data = await apiFetch(endpoint);
      
      console.log(`MessagingContext - Fetched ${userRole} conversations:`, data);
      setConversations(data || []);
      
      // Don't auto-select first conversation - let user choose
      // if (data && data.length > 0 && !selectedConversationId) {
      //   setSelectedConversationId(data[0].id);
      //   joinRoom(data[0].id);
      // }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
      setConversations([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [userRole, selectedConversationId, profile?._id, profile?.role]);

  // Load conversations on mount and when userRole changes
  useEffect(() => {
    if (profile?._id && profile?.role) {
      console.log("MessagingContext - Profile available, fetching conversations:", {
        profileId: profile._id,
        profileRole: profile.role,
        userRole
      });
      // Ensure socket is authenticated before fetching conversations
      ensureSocketAuth();
      fetchConversations();
    } else {
      console.log("MessagingContext - Profile not available yet:", {
        profileId: profile?._id,
        profileRole: profile?.role,
        userRole
      });
    }
  }, [profile?._id, profile?.role, userRole]); // Added profile.role to dependencies

  // Select conversation and join room
  const selectConversation = useCallback((conversationId) => {
    // If conversationId is null, just clear the selection (close chat)
    if (!conversationId) {
      setSelectedConversationId(null);
      return;
    }
    
    // If selecting the same conversation, do nothing
    if (conversationId === selectedConversationId) return;
    
    // Select new conversation and join room
    setSelectedConversationId(conversationId);
    joinRoom(conversationId);
  }, [selectedConversationId]);

  // Handle initial conversation selection when conversations are loaded
  useEffect(() => {
    if (initialConversationId && conversations.length > 0 && !selectedConversationId) {
      const targetConversation = conversations.find(c => c.id === initialConversationId);
      if (targetConversation) {
        selectConversation(initialConversationId);
      }
    }
  }, [initialConversationId, conversations, selectedConversationId, selectConversation]);

  // Send message function
  const sendMessage = useCallback(async (conversationId, text) => {
    if (!text.trim() || !conversationId) return;
    
    try {
      setSendingMessage(true);
      
      // Create temporary message for immediate UI feedback
      const tempMessage = {
        id: `temp-${Date.now()}`,
        text: text.trim(),
        sender: profile._id,
        senderName: profile.name,
        date: new Date(),
        fromMe: true,
        isTemporary: true
      };

      // Add temporary message to UI
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, tempMessage]
          };
        }
        return conv;
      }));

      // Send to backend
      const response = await apiFetch(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: text.trim() })
      });

      if (response && response.id) {
        // Remove temporary message and add real one
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            const realMessage = {
              ...response,
              fromMe: true,
              isTemporary: false
            };
            
            return {
              ...conv,
              messages: [
                ...conv.messages.filter(msg => !msg.isTemporary),
                realMessage
              ]
            };
          }
          return conv;
        }));
        
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      
      // Remove temporary message on error
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages.filter(msg => !msg.isTemporary)
          };
        }
        return conv;
      }));
    } finally {
      setSendingMessage(false);
    }
  }, [profile]);

  // Socket event handler
  useSocket((data) => {
    console.log("MessagingContext - Socket event received:", data);
    
    if (data.conversationId && data.message) {
      const currentUserId = profile?._id;
      
      // Calculate fromMe based on current user
      const messageWithFromMe = {
        ...data.message,
        fromMe: data.message.sender.toString() === currentUserId.toString()
      };
      
      console.log("Processing socket message:", {
        message: data.message,
        currentUserId,
        senderId: data.message.sender,
        fromMe: messageWithFromMe.fromMe,
        comparison: `${data.message.sender.toString()} === ${currentUserId.toString()}`
      });
      
      // Only add messages that are NOT from the current user
      // This prevents duplicates since the sender already added their message locally
      if (!messageWithFromMe.fromMe) {
        setConversations(prev => prev.map(conv => {
          if (conv.id === data.conversationId) {
            // Check if message already exists to prevent duplicates
            const messageExists = conv.messages.some(msg => 
              msg.id === data.message.id || 
              (msg.text === data.message.text && msg.sender.toString() === data.message.sender.toString())
            );
            
            if (!messageExists) {
              return {
                ...conv,
                messages: [...conv.messages, messageWithFromMe]
              };
            }
          }
          return conv;
        }));
      } else {
        console.log("Ignoring own message from socket to prevent duplicates");
      }
    }
  });

  // Listen for typing events
  useSocket((data) => {
    if (data && data.conversationId && typeof data.isTyping === 'boolean') {
      setPartnerTypingByConv((prev) => ({
        ...prev,
        [data.conversationId]: data.isTyping
      }));
    }
  });

  // Get selected conversation
  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const partnerTyping = selectedConversationId ? !!partnerTypingByConv[selectedConversationId] : false;

  const value = {
    conversations,
    selectedConversationId,
    selectedConversation,
    loading,
    sendingMessage,
    sendMessage,
    selectConversation,
    fetchConversations,
    partnerTyping
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
};
