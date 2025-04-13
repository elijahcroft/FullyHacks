import React, { useEffect, useState, useRef } from 'react';
import { getFriendProfiles } from '../lib/supabase_helper';
import './Card.css';

interface CardProps {
  userId: string;
  name: string;
  location?: string;
  avatarUrl?: string;
  onAddNode: (name: string) => void; // Add this prop to handle adding a node
}

const Card: React.FC<CardProps> = ({ userId, name, location, avatarUrl, onAddNode }) => {
  const [friendCount, setFriendCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [isFriendAdded, setIsFriendAdded] = useState<boolean>(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFriendCount = async () => {
      try {
        setLoading(true);
        const friendsList = await getFriendProfiles(userId);
        setFriendCount(friendsList.length);
        setFriends(friendsList);
      } catch (error) {
        console.error('Error fetching friend count:', error);
        setFriendCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendCount();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        setShowDetails(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleAddFriend = () => {
    onAddNode(name); // Add a node with the friend's name
    setIsFriendAdded(true); // Disable the button after adding
  };

  return (
    <div className="cosmic-card">
      <div className="card-glow"></div>
      <div className="card-content">
        <div className="card-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="avatar-image" />
          ) : (
            <div className="avatar-fallback">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="card-info">
          <h3 className="card-name">{name}</h3>
          {location && <p className="card-location">{location}</p>}
          <button 
            className={`add-friend-btn minimal-btn ${isFriendAdded ? 'disabled' : ''}`} 
            onClick={handleAddFriend} 
            disabled={isFriendAdded}
          >
            {isFriendAdded ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
