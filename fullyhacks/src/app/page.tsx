  'use client';
  
import { useRouter } from 'next/router';
  import './page.css';
  import { signIn, signOut, useSession } from "next-auth/react";

  const MainPage = () => {
    const { data: session } = useSession();
    const router = useRouter();
    if (session) {
      router.push('/graph');
      return null;
    };

    return (
      <div className='center'>
      <div className="box">
        <h1>{session ? `Welcome, ${session.user?.name}` : "Login"}</h1>
        <hr className='line' />
        <div className='inner'>
          {session ? (
            <button className="github-btn" onClick={() => signOut()}>
              Sign Out
            </button>
          ) : (
            <button className="github-btn" onClick={() => signIn("github")}>
              <svg
                className="github-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M12 0.297c-6.627 0-12 5.373-12 12 0 5.303 
                  3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 
                  0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 
                  1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.304 
                  3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 
                  0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 
                  0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.404 
                  11.52 11.52 0 013.003.404c2.292-1.552 
                  3.298-1.23 3.298-1.23.653 1.653.241 2.874.118 
                  3.176.77.84 1.235 1.911 1.235 3.221 
                  0 4.609-2.803 5.624-5.475 5.921.43.371.823 
                  1.102.823 2.222 0 1.606-.014 2.896-.014 3.286 
                  0 .319.218.694.825.576C20.565 22.092 24 17.592 24 
                  12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>
    </div>
    );
  }

  export default MainPage;
