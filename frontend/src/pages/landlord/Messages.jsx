import { MessagingProvider } from '../../contexts/MessagingContext';
import Messages from '../../components/messaging/Messages';
import { useOutletContext } from 'react-router-dom';

export default function LandlordMessages() {
  const { profile } = useOutletContext();
  
  return (
    <MessagingProvider userRole="landlord" profile={profile}>
      <Messages />
    </MessagingProvider>
  );
}
