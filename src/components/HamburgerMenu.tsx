import React, { useId, useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X } from 'lucide-react';

type MenuButtonProps = {
	to: string;
	selected: boolean;
	label: string;
	onNavigate: () => void;
};

const MenuButton: React.FC<MenuButtonProps> = ({ to, selected, label, onNavigate }) => {
		return (
				<Link to={to} aria-current={selected ? 'page' : undefined}
					className="menu-link"
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

	return (
		<div className="relative ml-2" ref={menuRef} onKeyDown={event => {
			if (event.key === 'Escape' && open) { event.stopPropagation(); setOpen(false); buttonRef.current?.focus(); }
		}} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
			<button
				className="menu-toggle"
				ref={buttonRef}
				type="button"
				aria-label="Menu"
				aria-expanded={open}
				aria-controls={open ? menuId : undefined}
				onClick={() => setOpen((prev) => !prev)}
			>
				{open ? <X size={20} strokeWidth={1.8} aria-hidden="true" /> : <Menu size={20} strokeWidth={1.8} aria-hidden="true" />}
			</button>
			{open && (
				<div id={menuId} className="site-menu">
					<div className="menu-school" role="group" aria-label="School">
						<button
							aria-label="Upper school" aria-pressed={scheduleType === 'US'} title="Upper school"
							type="button"
							onClick={() => setScheduleType('US')}
						>
							US
						</button>
						<button
							aria-label="Middle school" aria-pressed={scheduleType === 'MS'} title="Middle school"
							type="button"
							onClick={() => setScheduleType('MS')}
						>
							MS
						</button>
					</div>
					<div>
						<MenuButton
							to="/"
							selected={location.pathname === '/'}
							label="Home"
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
									type="button" className="menu-logout"
								>
									Logout
								</button>
							)}
					</div>
					<div className="menu-credit">
    Joe Borgman & Asad Sadikov
</div>
				</div>
			)}
		</div>
	);
};

export default HamburgerMenu;
