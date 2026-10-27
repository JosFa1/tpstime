import React, { useId, useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type MenuButtonProps = {
	to: string;
	selected: boolean;
	label: string;
	rounded?: string;
	onNavigate: () => void;
};

const MenuButton: React.FC<MenuButtonProps> = ({ to, selected, label, rounded, onNavigate }) => {
		return (
				<Link to={to} aria-current={selected ? 'page' : undefined}
					className={`menu-link block w-full text-left px-4 py-2 text-text ${rounded || ''} ${selected ? 'font-bold' : 'font-semibold'}`}
					onClick={onNavigate}
				>
					{label}
				</Link>
		);
};



const HamburgerMenu: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { logout } = useAuth();
	const enableAuthEnv = process.env.REACT_APP_ENABLE_AUTH;
	const enableAuth = !(enableAuthEnv === 'false' || enableAuthEnv === '0');
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const menuId = useId();
	const closeMenu = () => setOpen(false);
	const [scheduleType, setScheduleType] = useState<'US' | 'MS'>(() => {
		const saved = localStorage.getItem('scheduleType');
		return saved === 'MS' ? 'MS' : 'US';
	});

	useEffect(() => {
		localStorage.setItem('scheduleType', scheduleType);
		// Optionally trigger a custom event for app-wide update
		window.dispatchEvent(new CustomEvent('scheduleTypeChanged', { detail: scheduleType }));
	}, [scheduleType]);

	useEffect(() => {
			const handleClickOutside = (event: PointerEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		if (open) {
			document.addEventListener('pointerdown', handleClickOutside);
		} else {
			document.removeEventListener('pointerdown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('pointerdown', handleClickOutside);
		};
	}, [open]);

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	const hamburgerBtnBase = "menu-toggle flex flex-col justify-center items-center w-11 h-11 rounded-lg border-2 border-primary bg-background shadow-sm";

	return (
		<div className="relative ml-2" ref={menuRef} onKeyDown={event => {
			if (event.key === 'Escape' && open) { event.stopPropagation(); setOpen(false); buttonRef.current?.focus(); }
		}} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
			<button
				className={hamburgerBtnBase}
				ref={buttonRef}
				type="button"
				aria-label="Menu"
				aria-expanded={open}
				aria-controls={open ? menuId : undefined}
				onClick={() => setOpen((prev) => !prev)}
			>
				<span className="block w-6 h-1 bg-primary mb-1 rounded transition-all"></span>
				<span className="block w-6 h-1 bg-primary mb-1 rounded transition-all"></span>
				<span className="block w-6 h-1 bg-primary rounded transition-all"></span>
			</button>
			{open && (
				<div id={menuId} className="site-menu absolute right-0 mt-2 w-44 bg-background border border-accent rounded shadow-lg z-50">
					<div className="flex flex-row gap-2 px-2 pt-2 pb-2">
						<button
							aria-label="Upper school" aria-pressed={scheduleType === 'US'} title="Upper school"
							className={`flex-1 px-0 py-2 rounded-lg border-2 text-base font-bold transition-colors duration-150 mx-0 ${scheduleType === 'US' ? 'bg-primary text-background border-primary font-bold' : 'bg-background text-primary border-primary'}`}
							style={{marginLeft: 0, marginRight: 0}}
							onClick={() => setScheduleType('US')}
						>
							US
						</button>
						<button
							aria-label="Middle school" aria-pressed={scheduleType === 'MS'} title="Middle school"
							className={`flex-1 px-0 py-2 rounded-lg border-2 text-base font-bold transition-colors duration-150 mx-0 ${scheduleType === 'MS' ? 'bg-primary text-background border-primary font-bold' : 'bg-background text-primary border-primary'}`}
							style={{marginLeft: 0, marginRight: 0}}
							onClick={() => setScheduleType('MS')}
						>
							MS
						</button>
					</div>
					<div className="pt-2">
						<MenuButton
							to="/"
							selected={location.pathname === '/'}
							label="Home"
							rounded="rounded-t"
							onNavigate={closeMenu}
						/>
						<MenuButton
							to="/settings"
							selected={location.pathname === '/settings'}
							label="Settings"
							onNavigate={closeMenu}
						/>
						<MenuButton
							to="/houses"
							selected={location.pathname === '/houses'}
							label="Houses"
							onNavigate={closeMenu}
						/>
						<MenuButton
							to="/grille"
							selected={location.pathname === '/grille'}
							label="Grille Menu"
							onNavigate={closeMenu}
						/>
						<MenuButton
							to="/info"
							selected={location.pathname === '/info'}
							label="Info"
							onNavigate={closeMenu}
						/>
							{enableAuth && (
								<button
									onClick={handleLogout}
									className="w-full text-left px-4 py-3 text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors font-semibold rounded-b"
								>
									Logout
								</button>
							)}
					</div>
					<div className="w-full text-center text-xs text-gray-500 mt-4 mb-2">
    Joe Borgman & Asad Sadikov
</div>
				</div>
			)}
		</div>
	);
};

export default HamburgerMenu;
