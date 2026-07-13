import { createContext, useContext, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import pusher from "../services/pusherClient";
import toast from "react-hot-toast";
import { IoBatteryCharging, IoRestaurant } from "react-icons/io5";
import { BsPersonRaisedHand } from "react-icons/bs";
import { BiSolidDish } from "react-icons/bi";
import { TbAlertTriangleFilled, TbReceipt } from "react-icons/tb";

const PusherContext = createContext({});

export const PusherProvider = ({ children }) => {
	const queryClient = useQueryClient();
	const { user } = useAuthStore();
	const restaurantId = user?.restaurant_id;
	const channelRef = useRef(null);
	const isSubscribedRef = useRef(false);

	useEffect(() => {
		if (!restaurantId || isSubscribedRef.current) return;

		console.log(
			"🔄 Setting up global Pusher subscription for restaurant:",
			restaurantId,
		);

		// Test connection states
		pusher.connection.bind("state_change", (states) => {
			console.log("Pusher state changed:", states.current);
		});

		pusher.connection.bind("connected", () => {
			console.log("✅ Global Pusher connected successfully!");
		});

		pusher.connection.bind("error", (err) => {
			console.error("❌ Global Pusher connection error:", err);
		});

		// Subscribe to restaurant channel
		const channel = pusher.subscribe(`restaurant-${restaurantId}`);
		channelRef.current = channel;
		isSubscribedRef.current = true;

		// Global event handler for all events (debugging)
		channel.bind_global((eventName, data) => {
			console.log("🌐 GLOBAL EVENT RECEIVED:", eventName);
			console.log("📦 Event data:", data);
		});

		// Subscription success
		channel.bind("pusher:subscription_succeeded", () => {
			console.log(
				"✅ Global subscription successful:",
				`restaurant-${restaurantId}`,
			);
		});

		// Handle luxegenie assignment events
		channel.bind("luxegenie-assigned", (data) => {
			console.log("🤖 Global: LuxeGenie assigned event received:", data);

			// Invalidate all relevant queries globally
			queryClient.invalidateQueries(["luxegenie-devices", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);

			console.log(
				"🔄 Invalidated queries globally for luxegenie assignment",
			);
		});

		// Handle luxegenie unassignment events
		channel.bind("luxegenie-unassigned", (data) => {
			console.log(
				"🤖 Global: LuxeGenie unassigned event received:",
				data,
			);

			// Invalidate all relevant queries globally
			queryClient.invalidateQueries(["luxegenie-devices", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			queryClient.invalidateQueries(["vacant-tables", restaurantId]);

			console.log(
				"🔄 Invalidated queries globally for luxegenie unassignment",
			);
		});

		channel.bind("checked-in", (data) => {
			console.log("✅ Global: Checked-in event received:", data);
			queryClient.invalidateQueries([
				"restaurant-reservations",
				restaurantId,
			]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind(`tap-for-service-activated`, (data) => {
			console.log(
				"✅ Global: tap-for-service-activated event received:",
				data,
			);
			// queryClient.invalidateQueries(["restaurant-reservations", restaurantId]);
			toast(data.message, {
				icon: <BsPersonRaisedHand size={20} />,
				style: {
					color: "#f97316", // orange-500
					border: "1px solid #f97316",
				},
			});
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			// queryClient.invalidateQueries(["vacant-tables", restaurantId]);
			// toast.success(`Tap For Service Requested !`);
		});

		channel.bind(`tap-for-service-deactivated`, (data) => {
			console.log(
				"✅ Global: tap-for-service-deactivated event received:",
				data,
			);
			// queryClient.invalidateQueries(["restaurant-reservations", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			// queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind(`physical-menu-request-activated`, (data) => {
			console.log(
				"✅ Global: physical-menu-request-activated event received:",
				data,
			);
            toast(data.message, {
				icon: <IoRestaurant size={20} />,
				style: {
					color: "#3b82f6", // blue-500
					border: "1px solid #3b82f6",
				},
			});
			// queryClient.invalidateQueries(["restaurant-reservations", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			// queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind(`physical-menu-request-deactivated`, (data) => {
			console.log(
				"✅ Global: physical-menu-request-deactivated event received:",
				data,
			);
			// queryClient.invalidateQueries(["restaurant-reservations", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);

			// queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind(`power-bank-request-activated`, (data) => {
			console.log(
				"✅ Global: power-bank-request-activated event received:",
				data,
			);
            toast(data.message, {
				icon: <IoBatteryCharging size={20} />,
				style: {
					color: "#6366f1", // indigo-500
					border: "1px solid #6366f1",
				},
			});
			// queryClient.invalidateQueries(["restaurant-reservations", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			// queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind(`power-bank-request-deactivated`, (data) => {
			console.log(
				"✅ Global: power-bank-request-deactivated event received:",
				data,
			);
			// queryClient.invalidateQueries(["restaurant-reservations", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			// queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind(`managers-attention-request-activated`, (data) => {
			console.log(
				"✅ Global: managers-attention-request-activated event received:",
				data,
			);
            toast(data.message, {
				icon: <TbAlertTriangleFilled size={20} />,
				style: {
					color: "#ef4444", // red-500
					border: "1px solid #ef4444",
				},
			});
			// queryClient.invalidateQueries(["restaurant-reservations", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			// queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind(`managers-attention-request-deactivated`, (data) => {
			console.log(
				"✅ Global: managers-attention-request-deactivated event received:",
				data,
			);
			// queryClient.invalidateQueries(["restaurant-reservations", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			// queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind(`chefs-special-request-activated`, (data) => {
			console.log(
				"✅ Global: chefs-special-request-activated event received:",
				data,
			);
            toast(data.message, {
				icon: <BiSolidDish size={20} />,
				style: {
					color: "#eab308", // yellow-500
					border: "1px solid #eab308",
				},
			});
			// queryClient.invalidateQueries(["restaurant-reservations", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			// queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind(`chefs-special-request-deactivated`, (data) => {
			console.log(
				"✅ Global: chefs-special-request-deactivated event received:",
				data,
			);
			// queryClient.invalidateQueries(["restaurant-reservations", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			// queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});
		
		channel.bind(`chefs-special-customization-request-activated`, (data) => {
			console.log(
				"✅ Global: chefs-special-customization-request-activated event received:",
				data,
			);
			toast(data.message, {
				icon: <BiSolidDish size={20} />,
				style: {
					color: "#eab308", // yellow-500
					border: "1px solid #eab308",
				},
			});
			// queryClient.invalidateQueries(["restaurant-reservations", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			// queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind(`chefs-special-customization-request-deactivated`, (data) => {
			console.log(
				"✅ Global: chefs-special-customization-request-deactivated event received:",
				data,
			);
			// queryClient.invalidateQueries(["restaurant-reservations", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			// queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind(`bill-request-activated`, (data) => {
			console.log(
				"✅ Global: bill-request-activated event received:",
				data,
			);
            toast(data.message, {
				icon: <TbReceipt size={20} />,
				style: {
					color: "#22c55e", // green-500
					border: "1px solid #22c55e",
				},
			});
			// queryClient.invalidateQueries(["restaurant-reservations", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			// queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind(`bill-request-deactivated`, (data) => {
			console.log(
				"✅ Global: bill-request-deactivated event received:",
				data,
			);
			// queryClient.invalidateQueries(["restaurant-reservations", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			// queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind(`updated-bill-amount`, (data) => {
			console.log("✅ Global: updated-bill-amount event received:", data);
			// Invalidate session activities queries to refresh bill amount data
			queryClient.invalidateQueries(["sessionActivities", restaurantId]);
			// Also invalidate restaurant tables to update bill status
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
		});

		channel.bind(`edited-bill-amount`, (data) => {
			console.log("✅ Global: edited-bill-amount event received:", data);
			// Invalidate session activities queries to refresh bill amount data
			queryClient.invalidateQueries(["sessionActivities", restaurantId]);
			// Also invalidate restaurant tables to update bill status
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
		});

		channel.bind(`transferred-a-session`, (data) => {
			console.log(
				"✅ Global: transferred-a-session event received:",
				data,
			);
			queryClient.invalidateQueries(["sessionActivities", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			// queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind(`session-terminated`, (data) => {
			console.log(
				"✅ Global: session-terminated event received:",
				data,
			);
			queryClient.invalidateQueries(["sessionActivities", restaurantId]);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		// ==================== New Event Handlers for Real-time Sync ====================

		// 1. Chef Special Dish Events
		channel.bind("chef-special-dish-created", (data) => {
			console.log("🍽️ Global: Chef special dish created:", data);
			queryClient.invalidateQueries(["chef-specials", restaurantId]);
		});

		channel.bind("chef-special-dish-updated", (data) => {
			console.log("🍽️ Global: Chef special dish updated:", data);
			queryClient.invalidateQueries(["chef-specials", restaurantId]);
		});

		// 2. Reservation Events
		channel.bind("reservation-created", (data) => {
			console.log("📅 Global: Reservation created:", data);
			queryClient.invalidateQueries(["reservations", restaurantId]);
			queryClient.invalidateQueries([
				"restaurant-reservations",
				restaurantId,
			]);
			queryClient.invalidateQueries(["guest-list", restaurantId]);
		});

		channel.bind("reservation-updated", (data) => {
			console.log("📅 Global: Reservation updated:", data);
			queryClient.invalidateQueries(["reservations", restaurantId]);
			queryClient.invalidateQueries([
				"restaurant-reservations",
				restaurantId,
			]);
			queryClient.invalidateQueries(["guest-list", restaurantId]);
		});

		// 3. Chef Events
		channel.bind("chef-created", (data) => {
			console.log("👨‍🍳 Global: Chef created:", data);
			queryClient.invalidateQueries(["chefs", restaurantId]);
		});

		channel.bind("chef-updated", (data) => {
			console.log("👨‍🍳 Global: Chef updated:", data);
			queryClient.invalidateQueries(["chefs", restaurantId]);
		});

		// 4. Event (Restaurant Event) Events
		channel.bind("event-created", (data) => {
			console.log("🎉 Global: Event created:", data);
			queryClient.invalidateQueries(["events", restaurantId]);
		});

		channel.bind("event-updated", (data) => {
			console.log("🎉 Global: Event updated:", data);
			queryClient.invalidateQueries(["events", restaurantId]);
		});

		// 5. History (About Us) Events
		channel.bind("history-created", (data) => {
			console.log("📜 Global: Restaurant history created:", data);
			queryClient.invalidateQueries(["about-us", restaurantId]);
		});

		channel.bind("history-updated", (data) => {
			console.log("📜 Global: Restaurant history updated:", data);
			queryClient.invalidateQueries(["about-us", restaurantId]);
		});

		// 6. Loyalty Club Events
		channel.bind("loyalty-club-created", (data) => {
			console.log("💎 Global: Loyalty club created:", data);
			queryClient.invalidateQueries(["loyalty-clubs", restaurantId]);
		});

		channel.bind("loyalty-club-updated", (data) => {
			console.log("💎 Global: Loyalty club updated:", data);
			queryClient.invalidateQueries(["loyalty-clubs", restaurantId]);
		});

		// 7. Menu Events
		channel.bind("menu-created", (data) => {
			console.log("📋 Global: Menu created:", data);
			queryClient.invalidateQueries(["menu-settings", restaurantId]);
		});

		channel.bind("menu-updated", (data) => {
			console.log("📋 Global: Menu updated:", data);
			queryClient.invalidateQueries(["menu-settings", restaurantId]);
		});

		// 8. WiFi Events
		channel.bind("wifi-created", (data) => {
			console.log("📶 Global: WiFi created:", data);
			queryClient.invalidateQueries(["wifi-settings", restaurantId]);
		});

		channel.bind("wifi-updated", (data) => {
			console.log("📶 Global: WiFi updated:", data);
			queryClient.invalidateQueries(["wifi-settings", restaurantId]);
		});

		// 9. Table Events
		channel.bind("table-created", (data) => {
			console.log("🪑 Global: Table created:", data);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind("table-updated", (data) => {
			console.log("🪑 Global: Table updated:", data);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		// 10. Table Merge/Unmerge Events
		channel.bind("tables-merged", (data) => {
			console.log("🔗 Global: Tables merged:", data);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		channel.bind("tables-unmerged", (data) => {
			console.log("🔓 Global: Tables unmerged:", data);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			queryClient.invalidateQueries(["vacant-tables", restaurantId]);
		});

		// 11. Table Reservation Events
		channel.bind("table-reserved", (data) => {
			console.log("🔒 Global: Table reserved:", data);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			queryClient.invalidateQueries(["vacant-tables", restaurantId]);
			queryClient.invalidateQueries(["reservations", restaurantId]);
		});

		channel.bind("table-unreserved", (data) => {
			console.log("🔓 Global: Table unreserved:", data);
			queryClient.invalidateQueries(["restaurant-tables", restaurantId]);
			queryClient.invalidateQueries(["vacant-tables", restaurantId]);
			queryClient.invalidateQueries(["reservations", restaurantId]);
		});

		// 12. User Events
		channel.bind("user-created", (data) => {
			console.log("👤 Global: User created:", data);
			queryClient.invalidateQueries(["restaurant-users", restaurantId]);
		});

		channel.bind("user-updated", (data) => {
			console.log("👤 Global: User updated:", data);
			queryClient.invalidateQueries(["restaurant-users", restaurantId]);
		});

		// Cleanup function
		return () => {
			console.log("🧹 Cleaning up global Pusher subscription");
			if (channelRef.current) {
				channelRef.current.unbind_all();
				pusher.unsubscribe(`restaurant-${restaurantId}`);
				channelRef.current = null;
			}
			isSubscribedRef.current = false;
		};
	}, [restaurantId, queryClient]);

	// Cleanup on restaurant change
	useEffect(() => {
		return () => {
			if (channelRef.current && isSubscribedRef.current) {
				console.log("🧹 Cleaning up on restaurant change");
				channelRef.current.unbind_all();
				pusher.unsubscribe(`restaurant-${restaurantId}`);
				channelRef.current = null;
				isSubscribedRef.current = false;
			}
		};
	}, [restaurantId]);

	const contextValue = {
		pusher,
		restaurantId,
		isConnected: pusher.connection.state === "connected",
	};

	return (
		<PusherContext.Provider value={contextValue}>
			{children}
		</PusherContext.Provider>
	);
};

export const usePusher = () => {
	const context = useContext(PusherContext);
	if (!context) {
		throw new Error("usePusher must be used within a PusherProvider");
	}
	return context;
};

export default PusherProvider;
