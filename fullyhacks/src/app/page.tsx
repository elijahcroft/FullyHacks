  'use client';
  
  import './page.css';
  import { signIn, signOut, useSession } from "next-auth/react";

  const MainPage = () => {
    const { data: session } = useSession();

    return (
      <div className='center'>
        <div className="box">
          <h1>{session ? `Welcome, ${session.user?.name}` : "Login"}</h1>
          <hr className='line'></hr>
          <div className='inner'>
            {session ? (
              <>
                <button onClick={() => signOut()}>Sign Out</button>
              </>
            ) : (
              <>
                <button onClick={() => signIn("github")}>Login with GitHub</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  export default MainPage;
