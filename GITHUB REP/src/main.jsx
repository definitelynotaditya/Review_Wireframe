import React from "react";
import ReactDOM from "react-dom/client";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { PusherProvider } from "./context/PusherContext.jsx";
import "./App.css";

import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ViewHistory from "./pages/ViewHistory.jsx";
import Tables from "./pages/Tables.jsx";
import Luxegenies from "./pages/Luxegenies.jsx";
import Reservations from "./pages/Reservations.jsx";
import Users from "./pages/Users.jsx";
import Settings from "./pages/Settings.jsx";
import ChefSpecials from "./pages/ChefSpecials.jsx";
import ManageTables from "./pages/ManageTables.jsx";
import ManageSessions from "./pages/ManageSessions.jsx";
import GuestList from "./pages/GuestList.jsx";
import RecentActivities from "./pages/RecentActivities.jsx";

// PWA SERVICE WORKER REGISTRATION - Semi-automatic update (5s)

if ("serviceWorker" in navigator) {
	window.addEventListener("load", async () => {
		const registration = await navigator.serviceWorker.register(
			"/service-worker.js"
		);

		let updateDetected = false;

		// Detect new service worker
		registration.onupdatefound = () => {
			const newWorker = registration.installing;
			if (!newWorker) return;

			newWorker.onstatechange = () => {
				if (
					newWorker.state === "installed" &&
					navigator.serviceWorker.controller
				) {
					updateDetected = true;

					showUpdatePopup();

					// 🔥 Auto-update after 5 seconds
					setTimeout(() => {
						newWorker.postMessage({ type: "SKIP_WAITING" });
					}, 5000);
				}
			};
		};

		// Reload when new SW takes control
		navigator.serviceWorker.addEventListener("controllerchange", () => {
			if (updateDetected) {
				window.location.reload();
			}
		});

		// Periodic update check (every 30 min)
		setInterval(() => {
			registration.update();
		}, 30 * 60 * 1000);
	});
}

// UPDATE POPUP (INFO ONLY)

function showUpdatePopup() {
	const popup = document.createElement("div");
	popup.style.position = "fixed";
	popup.style.bottom = "20px";
	popup.style.right = "20px";
	popup.style.padding = "12px 16px";
	popup.style.background = "#111827";
	popup.style.color = "#ffffff";
	popup.style.borderRadius = "10px";
	popup.style.boxShadow = "0 10px 20px rgba(0,0,0,0.25)";
	popup.style.zIndex = "9999";
	popup.style.fontSize = "14px";
	popup.style.fontWeight = "500";

	popup.innerText = "New update available. Updating shortly…";

	document.body.appendChild(popup);
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			retry: 1,
		},
	},
});

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<PusherProvider>
				<ThemeProvider>
					<Router>
						<Routes>
							{/* Public Routes */}
							<Route path="/login" element={<Login />} />

							{/* Default Route */}
							<Route
								path="/"
								element={
									<Navigate to="/restaurant/tables" replace />
								}
							/>

							{/* Protected Routes */}
							<Route
								path="/restaurant/dashboard"
								element={
									<ProtectedRoute>
										<Dashboard />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/restaurant/view-history"
								element={
									<ProtectedRoute>
										<ViewHistory />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/restaurant/tables"
								element={
									<ProtectedRoute>
										<Tables />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/restaurant/users/all"
								element={
									<ProtectedRoute>
										<Users />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/restaurant/luxegenies"
								element={
									<ProtectedRoute>
										<Luxegenies />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/restaurant/reservations"
								element={
									<ProtectedRoute>
										<Reservations />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/restaurant/chef-specials"
								element={
									<ProtectedRoute>
										<ChefSpecials />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/restaurant/settings"
								element={
									<ProtectedRoute>
										<Settings />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/restaurant/manage-tables"
								element={
									<ProtectedRoute>
										<ManageTables />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/restaurant/manage-sessions"
								element={
									<ProtectedRoute>
										<ManageSessions />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/restaurant/guest-list"
								element={
									<ProtectedRoute>
										<GuestList />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/restaurant/recent-activities"
								element={
									<ProtectedRoute>
										<RecentActivities />
									</ProtectedRoute>
								}
							/>
						</Routes>

						{/* Toast configuration */}
						<Toaster
							position="top-right"
							toastOptions={{
								duration: 4000,
								style: {
									background: "#ffffff",
									color: "#333333",
									border: "1px solid #e5e7eb",
									borderRadius: "12px",
									boxShadow:
										"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
									fontSize: "14px",
									fontWeight: "500",
								},
								success: {
									style: {
										background: "#ffffff",
										color: "#065f46",
										border: "1px solid #d1fae5",
									},
								},
								error: {
									style: {
										background: "#ffffff",
										color: "#991b1b",
										border: "1px solid #fecaca",
									},
								},
							}}
						/>
					</Router>
				</ThemeProvider>
			</PusherProvider>
		</QueryClientProvider>
	</React.StrictMode>
);
