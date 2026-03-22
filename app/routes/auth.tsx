import React, { useEffect, type JSX } from 'react'
import { useLocation, useNavigate, type NavigateFunction} from 'react-router';
import { usePuterStore } from '~/lib/puter';

export const meta = () => ([
  { title: "Resumind | Auth" },
  { name: "description", content: "Log into your account" },
]);


const Auth: () => JSX.Element = () => {
    const {isLoading, auth} = usePuterStore();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const next = params.get("next") || "/";
    const navigate: NavigateFunction = useNavigate();
    
    useEffect(() => {
    if (auth.isAuthenticated) {
        navigate(next || "/", { replace: true });
    }
    }, [auth.isAuthenticated, next, navigate]);


    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex item-center justify-center">
            <div className="gradient-border shadow-lg">
                <section className="flex flex-col gap-8 bg-white round-2xl p-10">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1>Welcome</h1>
                        <h2>Log In To Continue Your Job Journey</h2>
                    </div>
                    <div>
                        {isLoading ? (
                            <button className='auth-button'>
                                <p>Signingyou in ...</p>
                            </button>
                        ):(
                            <>
                            {auth.isAuthenticated ? (
                                <button className="auth-button" onClick={auth.signOut}>
                                    <p>Log Out</p> 
                                </button>
                            ):(
                               <button className="auth-button" onClick={auth.signIn}>
                                    <p>Log In</p> 
                                </button> 
                            )}
                            </>
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}

export default Auth