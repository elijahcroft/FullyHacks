'use client';

import React, { useState } from 'react';
import './SideBar.css';
import Image from 'next/image';
import sidebar_img from '../images/list.png';
import user from '../images/user.png';

const SideBar = () => {
  const [profileInfo, setProfileInfo] = useState({
    id: 0,
    img: user,
    name: '',
    location: 'unknown',
  });

  const [showSideBar, setSideBar] = useState(false);
  const [connectionbtn, showConnectionBTN] = useState(false);

  function toggleSideBar() {
    setSideBar(prevSide => !prevSide);
  }

  function toggleConnection() {
    showConnectionBTN(prevbtn => !prevbtn);
  }

  return (
    <div>
      <button className="toggle-button" onClick={toggleSideBar}>
        <Image src={sidebar_img} alt="Toggle Sidebar" width={30} height={30} />
      </button>

      <div className={`side-bar ${!showSideBar ? 'hidden' : ''}`}>
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
            <li>{profileInfo.location}</li>
          </ul>
        </div>

        <div className="connections-container">
          <div className="scroll-connection">
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;