'use client';

import React, { useState, useEffect, useRef } from 'react';
import './SideBar.css';
import Image from 'next/image';
import sidebar_img from '../images/list.png';
import user from '../images/user.png';
import { removeFriend, addFriend, getAllPeople } from '../lib/supabase_helper';
import Card from './Card';

interface User {
  id: string;
  name: string;
  location?: string;
  avatar_url?: string;
  friends?: string[];
}

interface SideBarProps {
  onAddNode: (name: string) => void; // Ensure this matches the function signature
}

const SideBar: React.FC<SideBarProps> = ({ onAddNode }) => {
  const [profileInfo] = useState({
    id: 0,
    img: user,
    name: '',
    location: 'unknown',
  });

  const [isOpen, setIsOpen] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const allUsers = await getAllPeople();
        setUsers(allUsers as User[]);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollTop);
    }
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleAddNode = () => {
    const newNodeName = prompt("Enter the name of the new node:");
    if (newNodeName) {
      onAddNode(newNodeName); // Ensure this calls the passed function
    }
  };

  return (
    <div>
      

      <div className={`side-bar ${isOpen ? '' : 'hidden'}`}>
        <div className="user-profile">
          {profileInfo.img ? (
            <Image
              className="user-profile-img"
              src={profileInfo.img}
              alt="User Profile"
              width={60}
              height={60}
            />
          ) : (
            <div className="user-profile-img fallback">No Image</div>
          )}

          <ul className="list-of-user">
            <li className="user-name">{profileInfo.name}</li>
            <button className="addfollow-btn" onClick={() => removeFriend(1,2)}>Add Follow</button>
            <li>{profileInfo.location}</li>
          </ul>
          <button className="add-node-btn styled-btn" onClick={handleAddNode}>
            Add Node
          </button>
        </div>

        <div className="connections-container">
          <h3 className="constellations-header">Constellations</h3>
          <div 
            className="scroll-connection" 
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            {loading ? (
              <div className="loading-stars">Loading cosmic explorers...</div>
            ) : (
              users.map((user) => (
                <Card
                  key={user.id}
                  userId={user.id}
                  name={user.name || 'Unknown Explorer'}
                  location={user.location || 'Unknown Location'}
                  avatarUrl={user.avatar_url}
                  onAddNode={onAddNode} // Pass the onAddNode prop here
                />
              ))
            )}
          </div>
          
          {users.length > 5 && (
            <div className="scroll-controls">
              <button 
                className="scroll-btn scroll-up" 
                onClick={scrollToTop}
                disabled={scrollPosition <= 0}
              >
                ↑
              </button>
              <button 
                className="scroll-btn scroll-down" 
                onClick={scrollToBottom}
                disabled={scrollPosition >= (scrollContainerRef.current?.scrollHeight || 0) - (scrollContainerRef.current?.clientHeight || 0)}
              >
                ↓
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideBar;