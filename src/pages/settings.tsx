import LogButton from "../components/logButton";
import HamburgerMenu from "../components/HamburgerMenu";
import ThemeSwitcher from "../components/ThemeSwitcher";
import FooterNote from "../components/FooterNote";

function Settings() {
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
          
          {/* Theme selection always available */}
          <ThemeSwitcher />
          
          
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
