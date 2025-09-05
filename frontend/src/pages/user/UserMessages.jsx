import { MessagingProvider } from '../../contexts/MessagingContext';
import Messages from '../../components/messaging/Messages';
import { useOutletContext } from 'react-router-dom';

export default function UserMessages() {
  const { profile } = useOutletContext();
  
  return (
    <MessagingProvider userRole="tenant" profile={profile}>
      <Messages />
    </MessagingProvider>
  );
}
