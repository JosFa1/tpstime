import LogButton from "../components/logButton";
import HamburgerMenu from "../components/HamburgerMenu";
import ScheduleEditor from "../components/ScheduleEditor";
import ThemeSwitcher from "../components/ThemeSwitcher";
import FooterNote from "../components/FooterNote";

const enableYourSchedule = process.env.REACT_APP_ENABLE_YOUR_SCHEDULE === 'true';
const enableServerAccount = process.env.REACT_APP_ENABLE_SERVER_ACCOUNT === 'true';

function Settings() {
  
  // Get user data from localStorage if server accounts are enabled
  const user = enableServerAccount ? 
    (() => {
      try {
        return JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        return {};
      }
    })() : {};

  const isAdmin = enableServerAccount && user.role === 'admin';

  return (
    <div className="text-text bg-background min-h-screen w-full flex flex-col relative">
      {/* Top bar: HamburgerMenu top right */}
      <div className="w-full flex flex-row justify-between items-center pt-4 pb-2 px-2 sm:px-4">
        <div />
        <div className="flex flex-row items-center gap-2">
          <HamburgerMenu />
        </div>
      </div>
      {/* Main content */}
      <div className="flex flex-col items-center justify-center w-full bg-background px-2 py-6 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-2xl sm:text-3xl mb-8 text-text text-center">Settings</h1>
          
          {/* Show user info if server accounts are enabled and user is logged in */}
          {enableServerAccount && user.email && (
            <div className="border border-primary p-4 rounded-lg bg-muted">
              <h2 className="text-lg font-semibold mb-2">Account</h2>
              <p className="text-sm text-secondary">Logged in as: {user.email}</p>
              {isAdmin && (
                <p className="text-sm text-primary font-medium">Administrator</p>
              )}
            </div>
          )}

          {/* Theme selection always available */}
          <ThemeSwitcher />
          
          {/* Conditionally show Your Schedule module */}
          {enableYourSchedule && <ScheduleEditor />}
          
          {/* Admin-only features */}
          {isAdmin && (
            <div className="border border-primary p-4 rounded-lg bg-muted">
              <h2 className="text-lg font-semibold mb-2">Admin Features</h2>
              <div className="space-y-2">
                <button className="w-full p-2 bg-primary text-background rounded hover:opacity-80">
                  Manage House Points
                </button>
                <button className="w-full p-2 bg-primary text-background rounded hover:opacity-80">
                  Edit School Schedule
                </button>
              </div>
            </div>
          )}
          
          <div className="flex justify-center">
            <LogButton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col">
        <Settings />
      </div>
      <FooterNote />
    </div>
  );
}
