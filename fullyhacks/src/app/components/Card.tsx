import React, { useEffect, useState, useRef } from 'react';
import { getFriendProfiles } from '../lib/supabase_helper';
import './Card.css';

interface CardProps {
  userId: string;
  name: string;
  location?: string;
  avatarUrl?: string;
}

const Card: React.FC<CardProps> = ({ userId, name, location, avatarUrl }) => {
  const [friendCount, setFriendCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [friends, setFriends] = useState<any[]>([]);
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
          <div 
            className="friend-count" 
            onClick={toggleDetails}
            style={{ cursor: friends.length > 0 ? 'pointer' : 'default' }}
          >
            <span className="star-icon">★</span>
            <span className="count">
              {loading ? '...' : `${friendCount} ${friendCount === 1 ? 'friend' : 'friends'}`}
            </span>
          </div>
          
          {showDetails && friends.length > 0 && (
            <div className="friend-details" ref={detailsRef}>
              <div className="friend-details-header">
                <h4>Friends</h4>
                <button className="close-details" onClick={() => setShowDetails(false)}>×</button>
              </div>
              <div className="friend-list">
                {friends.map((friend) => (
                  <div key={friend.id} className="friend-item">
                    <div className="friend-avatar">
                      {friend.avatar_url ? (
                        <img src={friend.avatar_url} alt={friend.name} />
                      ) : (
                        <div className="friend-avatar-fallback">
                          {friend.name ? friend.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </div>
                    <div className="friend-info">
                      <div className="friend-name">{friend.name || 'Unknown'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
