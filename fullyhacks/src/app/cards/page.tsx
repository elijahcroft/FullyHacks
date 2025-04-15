'use client';

import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { getAllPeople } from '../lib/supabase_helper';
import './cards.css';

interface User {
  id: string;
  name: string;
  location?: string;
  avatar_url?: string;
  friends?: string[];
}

export default function CardsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="cards-container">
      <div className="cosmic-header">
        <h1>Cosmic Explorers</h1>
        <p>Discover fellow space travelers across the galaxy</p>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="cosmic-loader"></div>
          <p>Loading cosmic explorers...</p>
        </div>
      ) : (
        <div className="cards-grid">
          {users.map((user) => (
            <Card
              key={user.id}
              userId={user.id}
              name={user.name || 'Unknown Explorer'}
              location={user.location || 'Unknown Location'}
              avatarUrl={user.avatar_url}
            />
          ))}
        </div>
      )}
    </div>
  );
} 