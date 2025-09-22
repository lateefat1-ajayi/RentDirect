import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useMessaging } from '../../contexts/MessagingContext';
import { toast } from 'react-toastify';
import { apiFetch } from '../../lib/api';
import { emitTyping } from '../../services/socket';
import ProfileModal from '../ui/ProfileModal';

export default function Messages() {
  const {
    conversations,
    selectedConversationId,
    selectedConversation,
    loading,
    sendingMessage,
    sendMessage,
    selectConversation,
    fetchConversations,
    partnerTyping
  } = useMessaging();

  const location = useLocation();
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [deleteMessageId, setDeleteMessageId] = useState(null);
  const messagesEndRef = useRef(null);

  // Handle conversation selection from navigation state
  useEffect(() => {
    const conversationIdFromState = location.state?.conversationId;
    if (conversationIdFromState && conversations.length > 0) {
      const targetConversation = conversations.find(c => c.id === conversationIdFromState);
      if (targetConversation) {
        selectConversation(conversationIdFromState);
        // Clear the state to prevent re-selection on refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state?.conversationId, conversations, selectConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    const participantName = conv.participantName || '';
    const propertyTitle = conv.propertyTitle || '';
    const searchTerm = search.toLowerCase();
    
    return participantName.toLowerCase().includes(searchTerm) ||
           propertyTitle.toLowerCase().includes(searchTerm);
  });

  // Handle sending message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    
    await sendMessage(selectedConversationId, newMessage);
    setNewMessage("");
    // Stop typing when message is sent
    emitTyping(selectedConversationId, false);
  };

  // Handle editing message
  const handleEditMessage = async () => {
    if (!editText.trim() || !editingMessage) return;
    
    try {
      console.log("Editing message:", {
        conversationId: selectedConversationId,
        messageId: editingMessage.id,
        newText: editText.trim()
      });
      
      const response = await apiFetch(`/conversations/${selectedConversationId}/messages/${editingMessage.id}`, {
        method: 'PUT',
        body: JSON.stringify({ text: editText.trim() })
      });
      
      console.log("Edit response:", response);
      
      // Check if response has the expected structure
      if (response && response.id && response.text) {
        toast.success('Message updated successfully');
        setEditingMessage(null);
        setEditText("");
        
        // Refresh conversations to get updated message
        fetchConversations();
      } else {
        console.error("Unexpected response format:", response);
        throw new Error('Failed to update message - unexpected response format');
      }
    } catch (error) {
      console.error('Failed to update message:', error);
      toast.error(`Failed to update message: ${error.message}`);
    }
  };

  // Handle deleting message
  const handleDeleteMessage = async (messageId) => {
    try {
      console.log("Deleting message:", {
        conversationId: selectedConversationId,
        messageId: messageId
      });
      
      const response = await apiFetch(`/conversations/${selectedConversationId}/messages/${messageId}`, {
        method: 'DELETE'
      });
      
      console.log("Delete response:", response);
      
      if (response && response.message) {
        toast.success('Message deleted successfully');
        // Refresh conversations to get updated message list
        fetchConversations();
      } else {
        console.error("Unexpected delete response format:", response);
        throw new Error('Failed to delete message - unexpected response format');
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error(`Failed to delete message: ${error.message}`);
    }
  };

  // Format message time
  const formatMessageTime = (dateString) => {
    try {
      if (!dateString) return "No time";
      
      // Handle both date and createdAt fields
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string:", dateString);
        return "Invalid time";
      }
      
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error("Error formatting time:", error, dateString);
      return "Invalid time";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 grid place-items-center">
        <div className="text-sm text-gray-500">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Conversations List - Fixed width */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Messages</h2>
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {search ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedConversationId === conv.id ? 'bg-teal-50 dark:bg-teal-900/20 border-l-4 border-l-teal-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={conv.participantImage || null}
                    alt={conv.participantName || 'Unknown User'}
                    size="w-8 h-8"
                    isOnline={true} // You can implement real-time online status later
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {conv.participantName || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {conv.participantRole ? conv.participantRole.charAt(0).toUpperCase() + conv.participantRole.slice(1) : 'User'}
                    </p>
                    {conv.lastMessage && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                        {conv.lastMessage.text || 'No message'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area - Flexible width */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      console.log("Back button clicked, closing chat");
                      selectConversation(null);
                    }}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mr-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M15.78 4.72a.75.75 0 0 1 0 1.06L9.56 12l6.22 6.22a.75.75 0 1 1-1.06 1.06l-6.75-6.75a.75.75 0 0 1 0-1.06l6.75-6.75a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setProfileUser({
                        id: selectedConversation.participantId || 'unknown',
                        name: selectedConversation.participantName || 'Unknown User',
                        role: selectedConversation.participantRole || 'user',
                        profileImage: selectedConversation.participantImage || null
                      });
                      setShowProfileModal(true);
                    }}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Avatar
                      src={selectedConversation.participantImage || null}
                      alt={selectedConversation.participantName || 'Unknown User'}
                      size="w-8 h-8"
                      isOnline={true} // You can implement real-time online status later
                    />
                  </button>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {selectedConversation.participantName || 'Unknown User'}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {partnerTyping ? 'Typing…' : (selectedConversation.participantRole ? selectedConversation.participantRole.charAt(0).toUpperCase() + selectedConversation.participantRole.slice(1) : 'User')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {selectedConversation.messages?.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">Start the conversation by sending a message</p>
                </div>
              ) : (
                selectedConversation.messages?.map((msg, index) => (
                  <div
                    key={msg.id || `msg-${index}-${Date.now()}`}
                    className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-xs lg:max-w-md">
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          msg.fromMe
                            ? 'bg-teal-500 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <p className="text-sm break-words whitespace-pre-wrap mb-2">{msg.text || 'Empty message'}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                          </div>
                          <span className="text-xs opacity-75">
                            {formatMessageTime(msg.date)}
                          </span>
                        </div>
                      </div>
                      {/* Message Actions outside bubble */}
                      {msg.fromMe && (
                        <div className="flex items-center justify-end gap-3 mt-1">
                          <button
                            onClick={() => {
                              setEditingMessage(msg);
                              setEditText(msg.text || '');
                            }}
                            className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteMessageId(msg.id)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                  disabled={sendingMessage}
                  onFocus={() => selectedConversationId && emitTyping(selectedConversationId, true)}
                  onBlur={() => selectedConversationId && emitTyping(selectedConversationId, false)}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="px-6"
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 grid place-items-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center text-gray-500" >
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Message Modal */}
      {editingMessage && (
        <Modal
          isOpen={!!editingMessage}
          onClose={() => {
            setEditingMessage(null);
            setEditText("");
          }}
          title="Edit Message"
        >
          <div className="space-y-4">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Edit your message..."
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleEditMessage}
                disabled={!editText.trim()}
                className="flex-1"
              >
                Update
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingMessage(null);
                  setEditText("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Profile Modal - unified across app with reviews */}
      {showProfileModal && profileUser && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userId={profileUser.id}
          userRole={profileUser.role}
          currentUserRole={localStorage.getItem('userRole') || 'user'}
          currentUserId={localStorage.getItem('userId') || null}
        />
      )}

      {/* Delete Message Confirmation Modal */}
      {deleteMessageId && (
        <Modal
          isOpen={!!deleteMessageId}
          onClose={() => setDeleteMessageId(null)}
          title="Confirm Deletion"
        >
          <div className="space-y-4">
            <p>Are you sure you want to delete this message?</p>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  handleDeleteMessage(deleteMessageId);
                  setDeleteMessageId(null);
                }}
                className="flex-1"
              >
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteMessageId(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
