import { useState } from 'react';
import { useAuthStore } from '@stores';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { authService } from '@api/services/authService';
import { useNavigate } from "react-router-dom";

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Call the clean service layer based on the mode
      const data = isLogin 
        ? await authService.login(email, password)
        : await authService.signup(email, password);

      // 2. Update global state
      login(data.access_token, data.email);
      navigate("/");  

    } catch (error) {
      console.error("Authentication Error:", error);
      alert(isLogin ? "Invalid credentials." : "User already exists or invalid data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // The entire screen uses our soft `bg-canvas` and animates its colors
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas text-ink p-4 transition-colors duration-300 relative overflow-hidden">
      
      {/* 2. Floating Theme Toggle in the Top Right */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-10 bg-panel/80 backdrop-blur-sm border border-line rounded-full p-1 shadow-sm">
        <ThemeToggle />
      </div>

      {/* Subtle Background Decoration (Optional, adds a premium feel) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* 3. The Auth Card uses `bg-panel` to sit slightly above the canvas */}
      <div className="w-full max-w-md bg-panel rounded-[24px] shadow-float border border-line p-8 sm:p-10 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-ink text-canvas rounded-xl flex items-center justify-center font-bold font-serif text-2xl mx-auto mb-4 shadow-sm">
            S
          </div>
          {/* We use our gorgeous Fraunces Serif font here */}
          <h2 className="text-3xl font-serif font-bold tracking-tight text-ink mb-1.5">
            {isLogin ? 'Welcome back' : 'Join Smart Editor'}
          </h2>
          <p className="text-sm text-muted font-sans">
            {isLogin ? 'Enter your details to access your drafts.' : 'Create an account to start writing.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 font-sans">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-canvas border border-line rounded-xl text-ink text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-muted/50 shadow-sm inset-shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-canvas border border-line rounded-xl text-ink text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-muted/50 shadow-sm inset-shadow-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full py-3.5 mt-2 bg-ink text-canvas rounded-xl text-sm font-semibold shadow-pill hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-muted hover:text-ink transition-colors"
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-accent/30 hover:decoration-accent transition-all">
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}