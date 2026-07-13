import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useTheme } from "../../context/ThemeContext";

const Layout = ({ children, title, subtitle }) => {
	const [isMobile, setIsMobile] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { colors } = useTheme();

	useEffect(() => {
		const checkScreenSize = () => {
			const mobile = window.innerWidth < 1024; // lg breakpoint
			setIsMobile(mobile);
			if (!mobile) {
				setMobileMenuOpen(false); // Close mobile menu on desktop
			}
		};

		checkScreenSize();
		window.addEventListener("resize", checkScreenSize);

		return () => window.removeEventListener("resize", checkScreenSize);
	}, []);

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	return (
		<div className={`flex h-screen ${colors.secondary} overflow-hidden`}>
			{/* Mobile Backdrop */}
			{isMobile && mobileMenuOpen && (
				<div
					className="fixed inset-0 bg-black/70 bg-opacity-50 z-40 lg:hidden"
					onClick={() => setMobileMenuOpen(false)}
				/>
			)}

			<Sidebar
				isMobile={isMobile}
				mobileMenuOpen={mobileMenuOpen}
				closeMobileMenu={() => setMobileMenuOpen(false)}
			/>

			<div className="flex-1 flex flex-col overflow-hidden min-w-0">
				<Header
					title={title}
					subtitle={subtitle}
					isMobile={isMobile}
					onMenuToggle={toggleMobileMenu}
				/>

				<main className={`flex-1 overflow-y-auto ${colors.primary} p-2 sm:p-3 md:p-4 lg:p-6 scrollbar-none`}>
					<div className="max-w-7xl mx-auto w-full">{children}</div>
				</main>
			</div>
		</div>
	);
};

export default Layout;
