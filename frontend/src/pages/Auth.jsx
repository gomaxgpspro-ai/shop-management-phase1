import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, Eye, EyeOff, ArrowRight, ShieldCheck, Boxes, ChartNoAxesCombined } from "lucide-react";

function AuthShell({ children, title, subtitle, mode }) {
  return (
    <div className="auth-page">
      <div className="auth-brand"><div className="brand-mark"><Store size={23}/></div><strong>Shop<span>Flow</span></strong></div>
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-heading"><div className="auth-icon"><Store size={22}/></div><h1>{title}</h1><p>{subtitle}</p></div>
          {children}
          <div className="auth-switch">{mode === "login" ? <>Don't have an account? <Link to="/register">Create account</Link></> : <>Already have an account? <Link to="/login">Sign in</Link></>}</div>
        </div>
        <p className="auth-legal">By continuing, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</p>
      </div>
      <aside className="auth-aside">
        <div className="auth-aside-orb orb-one"/><div className="auth-aside-orb orb-two"/>
        <div className="auth-aside-content">
          <div className="auth-badge"><ShieldCheck size={15}/> SIMPLE. SMART. ORGANIZED.</div>
          <h2>Everything your shop needs, <span>in one place.</span></h2>
          <p>Bring your daily shop operations together with a clearer view of your business.</p>
          <div className="auth-feature"><span><ChartNoAxesCombined size={19}/></span><div><b>Business overview</b><small>See your shop at a glance</small></div></div>
          <div className="auth-feature"><span><Boxes size={19}/></span><div><b>Inventory workspace</b><small>Keep products organized</small></div></div>
          <div className="auth-aside-bottom">SHOPFLOW <span>•</span> SHOP MANAGEMENT SYSTEM</div>
        </div>
      </aside>
    </div>
  );
}

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const saved = (()=>{try{return JSON.parse(localStorage.getItem("shopflow.users.v1")||"[]")}catch{return []}})();
    const matched = saved.find(u=>(u.userId===email||u.name===email)&&u.password===password);
    if(matched){localStorage.setItem("shopflow.currentUser",matched.name);localStorage.setItem("shopflow.currentRole",matched.role);navigate(matched.role==="Employee"||matched.role==="Sales"?"/employee-dashboard":"/dashboard");return;}
    if(!saved.length && (email.toLowerCase()==="admin"||email.toLowerCase()==="admin@shop.com") && password==="admin123"){localStorage.setItem("shopflow.currentUser","Admin");localStorage.setItem("shopflow.currentRole","Administrator");navigate("/dashboard");return;}
    alert("Login ID or password is incorrect. Admin demo: admin / admin123");
  }

  return <AuthShell mode="login" title="Welcome back" subtitle="Enter your details to access your workspace.">
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>Email address<input type="email" placeholder="Login ID / Email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label>Password<div className="password-field"><input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required minLength={4}/><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
      <div className="auth-options"><label className="remember-check"><input type="checkbox"/> Remember me</label><a href="#forgot">Forgot password?</a></div>
      <button className="button button-primary auth-submit" type="submit">Sign in <ArrowRight size={17}/></button>
      <div className="demo-notice">Demo login: Admin / admin123. Users created in User Management can sign in with their ID and password.</div>
    </form>
  </AuthShell>;
}

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  function handleSubmit(e) {
    e.preventDefault();
    // Phase 1 UI only: no account is persisted.
    navigate("/login");
  }
  return <AuthShell mode="register" title="Create your account" subtitle="Set up your workspace to get started.">
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>Full name<input type="text" placeholder="Your full name" required /></label>
      <label>Shop name<input type="text" placeholder="Enter your shop name" required /></label>
      <label>Email address<input type="email" placeholder="Login ID / Email" required /></label>
      <label>Password<div className="password-field"><input type={showPassword ? "text" : "password"} placeholder="Create a password" minLength={6} required/><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
      <button className="button button-primary auth-submit" type="submit">Create account <ArrowRight size={17}/></button>
      <div className="demo-notice">Demo UI only — account registration is not connected to a database.</div>
    </form>
  </AuthShell>;
}
