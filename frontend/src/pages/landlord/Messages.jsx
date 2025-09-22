import { MessagingProvider } from '../../contexts/MessagingContext';
import Messages from '../../components/messaging/Messages';
import { useOutletContext, useSearchParams } from 'react-router-dom';

export default function LandlordMessages() {
  const { profile } = useOutletContext();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversation');
  
  return (
    <MessagingProvider 
      userRole="landlord" 
      profile={profile}
      initialConversationId={conversationId}
    >
      <Messages />
    </MessagingProvider>
  );
}
