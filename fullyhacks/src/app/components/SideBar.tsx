'use client';

import React, { useEffect, useState } from 'react';
import './SideBar.css';
import Image from 'next/image';
import sidebar_img from '../images/list.png';
import defaultUserImg from '../images/user.png';
import { getFriendNames, getFriendProfiles } from '../lib/supabase_helper';
import { supabase } from '../lib/supabase_helper';

  type Friend = {
    id: string;
    name: string;
    location?: string;
    avatar_url?: string;
  };

const SideBar = () => {
  const [profileInfo, setProfileInfo] = useState({
    id: 0,
    img: defaultUserImg,
    name: '',
    location: 'unknown',
  });




  const [friends, setFriends] = useState<Friend[]>([]);
  const [showSideBar, setSideBar] = useState(false);

  // Friends data implementation
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: me } = await supabase
        .from('profiles')             
        .select('id, name, location, avatar_url')
        .eq('id', authUser.id)
        .single();

      if (me) {
        setProfileInfo({
          id: me.id,
          name: me.name,
          location: me.location || 'unknown',
          img: me.avatar_url || defaultUserImg,
        });
      }

      const friendRows = await getFriendProfiles(authUser.id);
      setFriends(friendRows);
    };

    fetchData();
  }, []);

  function toggleSideBar() {
    setSideBar(prevSide => !prevSide);
  }

  return (
    <div>
      <button className="toggle-button" onClick={() => setSideBar(p => !p)}>
        <Image src={sidebar_img} alt="Toggle Sidebar" width={30} height={30} />
      </button>

      <div className={`side-bar ${!showSideBar ? 'hidden' : ''}`}>
        <div className="user-profile">
          <Image
            className="user-profile-img"
            src={profileInfo.img}
            alt="User"
            width={60}
            height={60}
          />
          <ul className="list-of-user">
            <li className="user-name">{profileInfo.name}</li>
            <li>{profileInfo.location}</li>
          </ul>
        </div>

        <div className="connections-container">
          <div className="scroll-connection">
            <h4 style={{ color: '#fff', marginBottom: 8 }}>Connections</h4>

            {friends.map(friend => (
              <div className="friend-card" key={friend.id}>
                <Image
                  src={friend.avatar_url || defaultUserImg}
                  alt={`${friend.name}'s avatar`}
                  width={50}
                  height={50}
                  className="friend-avatar"
                />
                <div className="friend-info">
                  <p className="friend-name">{friend.name}</p>
                  <p className="friend-location">
                    {friend.location || 'unknown'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;