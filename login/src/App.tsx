import { ChangeEventHandler, FormEventHandler, useState } from "react";
import { Wrapper } from "./styles";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./lib/firebase";

// Base URL of Stego server (used if no redirect param is present)
const STEGO_BASE = (import.meta as any).env?.VITE_STEGO_URL || '';

function App() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [password, setPassword] = useState("");

  const showSignIn = () => setIsSignUp(false);
  const showSignUp = () => setIsSignUp(true);

  // ✅ Firebase Auth logic
  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const pw = fd.get("password") as string;

    try {
      if (isSignUp) {
        // --- Sign up ---
        const cred = await createUserWithEmailAndPassword(auth, email, pw);
        await setDoc(doc(db, "users", cred.user.uid), {
          email,
          createdAt: Date.now(),
        });
      } else {
        // --- Sign in ---
        await signInWithEmailAndPassword(auth, email, pw);
      }

      // After successful auth, redirect via Stego to set session cookie
      const params = new URLSearchParams(window.location.search);
      const redirectParam = params.get('redirect');

      let targetHref = '';
      if (redirectParam) {
        // Use the redirect param from Stego guard and call Stego's /auth/callback
        const callbackBase = new URL('/auth/callback', redirectParam).toString();
        targetHref = `${callbackBase}?auth=1&redirect=${encodeURIComponent(redirectParam)}`;
      } else {
        // Fallback to configured STEGO_BASE (must be absolute origin)
        const base = STEGO_BASE || 'https://stego-v7mi.onrender.com';
        const callbackBase = new URL('/auth/callback', base).toString();
        const defaultNext = new URL('/', base).toString();
        targetHref = `${callbackBase}?auth=1&redirect=${encodeURIComponent(defaultNext)}`;
      }

      window.location.href = targetHref;
    } catch (err: any) {
      alert(err.message);
    }
  };

  const onChangeConfirmPass: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.value === password || e.target.value.length < 6) {
      e.target.setCustomValidity("");
    } else {
      e.target.setCustomValidity("Passwords do not match");
    }
  };

  return (
    <Wrapper>
      <div className={`container ${isSignUp ? "signup-active" : ""}`} id="container">
        {/* ---------------- SIGN UP FORM ---------------- */}
        <div className="form-container sign-up-container">
          <form onSubmit={onSubmit}>
            <h1>Create Account</h1>

            <label htmlFor="email">Email</label>
            <input name="email" type="email" placeholder="pigeon@nestcoop.com" required />

            <label htmlFor="password">Password</label>
            <input
              name="password"
              type="password"
              minLength={6}
              placeholder="******"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              minLength={6}
              placeholder="******"
              required
              onChange={onChangeConfirmPass}
            />

            <button type="submit">Create</button>

            <span className="link" onClick={showSignIn}>
              Already have an account?
            </span>
          </form>
        </div>

        {/* ---------------- SIGN IN FORM ---------------- */}
        <div className="form-container sign-in-container">
          <form onSubmit={onSubmit}>
            <h1>Sign in</h1>

            <label htmlFor="email">Email</label>
            <input name="email" type="email" placeholder="pigeon@nestcoop.com" required />

            <label htmlFor="password">Password</label>
            <input name="password" type="password" minLength={6} placeholder="******" required />

            <button type="submit">Login</button>

            <span className="link" onClick={showSignUp}>
              Create account
            </span>
          </form>
        </div>

        {/* ---------------- OVERLAY ---------------- */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <div className="title">Let's get you started</div>
              <p>Be part of our awesome team and have fun with us</p>
            </div>
            <div className="overlay-panel overlay-right">
              <div className="title">Hello There</div>
              <p>Don't have an account?</p>
              <p>Sign up with us today!</p>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

export default App;
