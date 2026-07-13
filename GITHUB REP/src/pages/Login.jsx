import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import axios from "axios";
import woobylogo from '/wooblylogo.svg';

const Login = () => {
	const [formData, setFormData] = useState({
		username: "",
		password: ""
	});
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const navigate = useNavigate();
	const { login } = useAuthStore();

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
		setError(""); // Clear error when user types
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const baseURL = import.meta.env.VITE_BASE_URL;
			const response = await axios.post(`${baseURL}/auth/login`, {
				username: formData.username,
				password: formData.password,
				restaurant_id: ""
			});

			if (response.data.success) {
				const { user, token } = response.data.data;
				const restaurant = response.data.restaurant;
				login({ user, token, restaurant });
				navigate("/");
			}
		} catch (error) {
			setError(error.response?.data?.message || "Login failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-black">
			{/* Left Side - Luxury Dark with Gold Accents */}
			<div className="hidden lg:flex lg:items-center lg:justify-center lg:w-1/2">
				<div className="flex flex-col gap-6 items-center px-8 font-chronicle">
                    <p className="text-7xl tracking-[10px] luxegenie-gradient drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] filter">BESPOKE</p>
                    <p className="text-7xl tracking-[10px] luxegenie-gradient drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] filter">EXPERIENCE</p>
                    <div className="flex items-center gap-4">
                        <div className="h-0.5 w-64 bg-gradient-to-r from-yellow-200 via-amber-500 to-yellow-600 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]"></div>
                        <div className="relative">
							<div className="absolute inset-0 bg-amber-400/40 rounded-full blur-xl"></div>
							<img src={woobylogo} alt="" className="w-16 filter drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] relative z-10"/>
						</div>
                        <div className="h-0.5 w-64 bg-gradient-to-r from-yellow-200 via-amber-500 to-yellow-600 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]"></div>
                    </div>
                </div>
			</div>

			{/* Right Side - Refined Dark Theme */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:mb-10">
				<div className="w-full max-w-md">
					{/* Logo and Title */}
					<div className="text-center mb-8">
						<div className="relative mb-4">
							{/* <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-lg"></div> */}
							<img
								src={woobylogo}
								alt="Woobly Logo"
								className="w-16 h-16 mx-auto filter drop-shadow-[0_0_15px_rgba(251,191,36,0.7)] relative z-10"
							/>
						</div>
						<h2 className="text-4xl font-chronicle text-white mb-2 drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">
							WOOBLY
						</h2>
						<p className="text-gray-400">
							Access Your Manager Dashboard
						</p>
					</div>

					{/* Error Message */}
					{error && (
						<div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg backdrop-blur-sm">
							<p className="text-red-300 text-sm">{error}</p>
						</div>
					)}

					{/* Login Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-sm md:text-lg font-medium text-gray-300 mb-2">
								Username
							</label>
							<input
								type="text"
								name="username"
								value={formData.username}
								onChange={handleInputChange}
								required
								className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-200 backdrop-blur-sm focus:shadow-[0_0_15px_rgba(251,191,36,0.3)]"
								placeholder="Enter your username or email"
							/>
						</div>

						<div>
							<label className="block text-sm lg:text-lg font-medium text-gray-300 mb-2">
								Password
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									name="password"
									value={formData.password}
									onChange={handleInputChange}
									required
									className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-200 pr-12 backdrop-blur-sm focus:shadow-[0_0_15px_rgba(251,191,36,0.3)]"
									placeholder="Enter your password"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-400 transition-colors duration-200"
								>
									{showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-gradient-to-r from-yellow-300 to-amber-300 hover:from-yellow-300 hover:to-amber-300 text-black py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_25px_rgba(251,191,36,0.6)] hover:cursor-pointer mt-8"
						>
							{loading ? (
								<>
									<FiLoader className="animate-spin mr-2" size={20} />
									Signing in...
								</>
							) : (
								"Sign In"
							)}
						</button>
					</form>

					{/* Footer */}
					<div className="mt-10 text-center text-gray-500 text-md">
						<p>© 2025 Woobly. All rights reserved.</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;