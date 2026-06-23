import type { CampaignConfig } from "./types";

export const demoCampaign: CampaignConfig = {
	slug: "demo",
	brand: "DebuggerMind",
	headline: "প্রাকৃতিক উপায়ে সুস্থতার সমাধান",
	subheadline:
		"১০০% ভেষজ উপাদানে তৈরি। বিশ্বস্ত গ্রাহকদের পছন্দ। ক্যাশ অন ডেলিভারিতে অর্ডার করুন।",
	heroImage:
		"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=80&auto=format&fit=crop",
	heroBullets: [
		"BCSIR পরীক্ষিত ও অনুমোদিত",
		"১০০% প্রাকৃতিক ও ভেষজ",
		"৭ দিনের মানি-ব্যাক গ্যারান্টি",
		"ক্যাশ অন ডেলিভারি সারা দেশে",
	],
	countdownMinutes: 10,
	countdownMessage: "এই অফার শেষ হবে — এখনই অর্ডার করলে পাবেন ফ্রি ডেলিভারি",
	trustBadges: [
		{ icon: "shield-check", label: "BCSIR পরীক্ষিত", sublabel: "ল্যাব রিপোর্ট" },
		{ icon: "award", label: "ISO সার্টিফাইড", sublabel: "মান নিয়ন্ত্রণ" },
		{ icon: "users", label: "২ লক্ষ+ গ্রাহক", sublabel: "সন্তুষ্ট গ্রাহক" },
	],
	benefits: [
		{
			icon: "leaf",
			title: "১০০% প্রাকৃতিক",
			description: "শুধুমাত্র ভেষজ উপাদান, কোনো রাসায়নিক নেই।",
		},
		{
			icon: "heart",
			title: "স্বাস্থ্য উপকার",
			description: "নিয়মিত ব্যবহারে দৃশ্যমান উন্নতি।",
		},
		{
			icon: "sparkles",
			title: "দ্রুত ফলাফল",
			description: "অল্প দিনেই অনুভব করবেন পরিবর্তন।",
		},
		{
			icon: "shield",
			title: "নিরাপদ ব্যবহার",
			description: "কোনো পার্শ্বপ্রতিক্রিয়া নেই।",
		},
		{
			icon: "thumbs-up",
			title: "গ্যারান্টিযুক্ত",
			description: "সন্তুষ্ট না হলে টাকা ফেরত।",
		},
		{
			icon: "truck",
			title: "সারা দেশে ডেলিভারি",
			description: "ঢাকার ভেতরে ২৪ ঘন্টা, বাইরে ২-৩ দিন।",
		},
	],
	personas: [
		{
			title: "ব্যস্ত পেশাজীবী",
			description:
				"যাদের সময় নেই কিন্তু সুস্থ থাকা চান — সহজ দৈনিক রুটিনে যোগ করুন।",
		},
		{
			title: "মধ্যবয়সী ও প্রবীণ",
			description:
				"বয়সের সাথে শরীরের যত্নে যারা প্রাকৃতিক সমাধান খুঁজছেন।",
		},
		{
			title: "স্বাস্থ্যসচেতন পরিবার",
			description:
				"যারা পরিবারের সবার সুস্থতার জন্য নিরাপদ পণ্য চান।",
		},
	],
	testimonials: [
		{
			name: "রহিম আহমেদ",
			location: "ঢাকা",
			rating: 5,
			review: "মাত্র ২ সপ্তাহে পার্থক্য বুঝতে পেরেছি। সত্যিই অসাধারণ।",
		},
		{
			name: "ফাতেমা বেগম",
			location: "চট্টগ্রাম",
			rating: 5,
			review: "আমার মা প্রতিদিন ব্যবহার করছেন। অনেক ভালো ফলাফল পেয়েছি।",
		},
		{
			name: "করিম হোসেন",
			location: "সিলেট",
			rating: 5,
			review: "ক্যাশ অন ডেলিভারিতে নিরাপদে অর্ডার করতে পেরেছি। পণ্যও আসল।",
		},
		{
			name: "নাসরিন আক্তার",
			location: "রাজশাহী",
			rating: 4,
			review: "প্যাকেজিং খুব ভালো। ব্যবহার করে স্বস্তি পাচ্ছি।",
		},
	],
	averageRating: 4.9,
	totalReviews: 2345,
	product: {
		id: 99001,
		name: "প্রিমিয়াম হেলথ প্যাক — ১ মাসের কোর্স",
		tagline: "এক মাসের সম্পূর্ণ কোর্স",
		image:
			"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80&auto=format&fit=crop",
		originalPrice: 1200,
		offerPrice: 990,
		stock: 100,
		tax: 0,
		taxType: "exclude",
	},
	bonuses: [
		{
			name: "ফ্রি গ্যাসট্রিক রিলিফ পাউডার",
			value: 400,
		},
	],
	offerLimitedNote: "খুবই সীমিত সময়ের জন্য",
	faqs: [
		{
			question: "এই পণ্য কি নিরাপদ?",
			answer:
				"হ্যাঁ, এটি BCSIR পরীক্ষিত এবং সম্পূর্ণ প্রাকৃতিক উপাদানে তৈরি। কোনো পার্শ্বপ্রতিক্রিয়া নেই।",
		},
		{
			question: "কতদিনে ফলাফল পাব?",
			answer:
				"নিয়মিত ব্যবহারে ২-৪ সপ্তাহের মধ্যে পরিবর্তন বুঝতে পারবেন। সম্পূর্ণ কোর্স শেষ করলে সর্বোচ্চ উপকার পাবেন।",
		},
		{
			question: "ডেলিভারি কত দিনে পাব?",
			answer:
				"ঢাকার ভেতরে ২৪ ঘন্টায়, ঢাকার বাইরে ২-৩ কর্মদিবসে পৌঁছে যাবে।",
		},
		{
			question: "পেমেন্ট কীভাবে করব?",
			answer:
				"ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন। অগ্রিম পেমেন্ট লাগবে না।",
		},
		{
			question: "পণ্য পছন্দ না হলে কী করব?",
			answer:
				"৭ দিনের মধ্যে অব্যবহৃত পণ্য ফেরত দিয়ে টাকা ফেরত পাবেন।",
		},
	],
	seoTitle: "প্রিমিয়াম হেলথ প্যাক — সীমিত সময়ের অফার | DebuggerMind",
	seoDescription:
		"BCSIR পরীক্ষিত ১০০% প্রাকৃতিক হেলথ প্যাক। ক্যাশ অন ডেলিভারি। সারা দেশে দ্রুত ডেলিভারি।",
};
