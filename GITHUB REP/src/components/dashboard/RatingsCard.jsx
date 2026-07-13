import { useTheme } from "../../context/ThemeContext";
import { FaUtensils, FaHandsHelping } from "react-icons/fa";
import { MdRoomService } from "react-icons/md";
import { IoStar } from "react-icons/io5";
import { useState } from "react";
import UnhappyFeedbackModal from "../modals/UnhappyFeedbackModal.jsx";
import { VscFeedback } from "react-icons/vsc";
import { VscThumbsdown } from "react-icons/vsc";
import { VscThumbsup } from "react-icons/vsc";

const RatingsCard = ({ ratings }) => {
	const { isDark } = useTheme();
	const [showUnhappyModal, setShowUnhappyModal] = useState(false);

	const feedbackData = ratings?.feedbackCount;

	const ratingCards = [
		{
			title: "Food",
			value: ratings?.food || 0,
			icon: FaUtensils,
			color: "bg-[#B69549]",
		},
		{
			title: "Service",
			value: ratings?.service || 0,
			icon: MdRoomService,
			color: "bg-[#B69549]",
		},
		{
			title: "Experience",
			value: ratings?.experience || 0,
			icon: FaHandsHelping,
			color: "bg-[#B69549]",
		},
	];

	return (
		<>
			<div
				className={`p-4 rounded-xl ${
					isDark
						? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
						: "bg-white border border-gray-200 shadow-sm"
				}`}
			>
				<div className="flex justify-between items-center gap-2 mb-4">
					<div className="flex gap-2">
						<IoStar className={"text-[#B69549]"} size={20} />
						<h2
							className={`text-md font-medium uppercase tracking-wide ${
								isDark ? "text-gray-200" : "text-gray-500"
							}`}
						>
							Average Ratings
						</h2>
					</div>
					{ratings?.sessions_with_all_ratings && (
						<p
							className={`text-md font-medium uppercase ${isDark ? "text-gray-400" : "text-gray-500"}`}
						>
							{ratings.sessions_with_all_ratings} ratings
						</p>
					)}
				</div>

				<div className="grid grid-cols-3 gap-4">
					{ratingCards.map((card, index) => {
						const Icon = card.icon;
						const rating = Number(card.value).toFixed(1);
						const percentage = (Number(card.value) / 5) * 100;

						return (
							<div
								key={index}
								className={`p-4 rounded-lg ${
									isDark ? "bg-gray-800/50" : "bg-gray-50"
								}`}
							>
								<div className="flex items-center gap-2 mb-3">
									<div
										className={`p-2 rounded-lg bg-gradient-to-br ${card.color}`}
									>
										<Icon
											className="text-white"
											size={14}
										/>
									</div>
									<span
										className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
									>
										{card.title}
									</span>
								</div>

								<div className="mb-2">
									<div className="flex items-baseline gap-1">
										<span
											className={`text-2xl font-bold ${isDark ? "luxegenie-gradient" : "text-[#9F7A24]"}`}
										>
											{rating}
										</span>
										<span
											className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
										>
											/5
										</span>
									</div>
								</div>

								{/* Progress bar */}
								<div
									className={`h-1.5 rounded-full overflow-hidden ${
										isDark ? "bg-gray-700" : "bg-gray-200"
									}`}
								>
									<div
										className={`h-full bg-gradient-to-r ${card.color} transition-all duration-500`}
										style={{ width: `${percentage}%` }}
									/>
								</div>
							</div>
						);
					})}
				</div>
				<hr
					className={`my-2 border-t ${isDark ? "border-gray-700" : "border-gray-300"}`}
				/>
				{/* Real-Time Experience */}
				{feedbackData && (
					<div className="mt-4">
						<div className="flex items-center gap-2 mb-3">
							<VscFeedback
								className={"text-[#B69549]"}
								size={20}
							/>
							<h2
								className={`text-md font-medium uppercase tracking-wide ${
									isDark ? "text-gray-200" : "text-gray-500"
								}`}
							>
								Feedback Summary
							</h2>
						</div>

						<div className="flex gap-8">
							<div className="flex items-center gap-3">
								<VscThumbsup size={24} color={isDark ? "#10B981" : "#059669"} />
								<p
									className={`text-2xl font-bold ${isDark ? "text-green-400" : "text-green-600"}`}
								>
									{feedbackData.thumbs_up_count}
								</p>
							</div>
							<button
								onClick={() => setShowUnhappyModal(true)}
								className="flex items-center gap-3 transition-opacity hover:opacity-80 cursor-pointer"
							>
								<VscThumbsdown size={24} color={isDark ? "#EF4444" : "#DC2626"} />
								<p
									className={`text-2xl font-bold ${isDark ? "text-red-400" : "text-red-600"}`}
								>
									{feedbackData.thumbs_down_count}
								</p>
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Unhappy Feedback Modal */}
			<UnhappyFeedbackModal
				isOpen={showUnhappyModal}
				onClose={() => setShowUnhappyModal(false)}
				feedbackData={feedbackData}
			/>
		</>
	);
};

export default RatingsCard;
