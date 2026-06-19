<script lang="ts">
	// Svelte 5 icon adapter. Public contract unchanged (`name`, `className`, `size`)
	// so the 30+ call sites keep using <Icon name="..." /> verbatim. Internally the
	// catalog now maps each semantic name to a tree-shakeable @lucide/svelte icon
	// (deep imports → only the icons listed below ship in the bundle).
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Bot from '@lucide/svelte/icons/bot';
	import Box from '@lucide/svelte/icons/package';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Check from '@lucide/svelte/icons/check';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Circle from '@lucide/svelte/icons/circle';
	import CircleUser from '@lucide/svelte/icons/circle-user';
	import Clock from '@lucide/svelte/icons/clock';
	import Compass from '@lucide/svelte/icons/compass';
	import Cookie from '@lucide/svelte/icons/cookie';
	import Cpu from '@lucide/svelte/icons/cpu';
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import FileCheck from '@lucide/svelte/icons/file-check';
	import FileText from '@lucide/svelte/icons/file-text';
	import Flag from '@lucide/svelte/icons/flag';
	import Folder from '@lucide/svelte/icons/folder';
	import Gavel from '@lucide/svelte/icons/gavel';
	import Globe from '@lucide/svelte/icons/globe';
	import HardHat from '@lucide/svelte/icons/hard-hat';
	import Headset from '@lucide/svelte/icons/headset';
	import Heart from '@lucide/svelte/icons/heart';
	import HelpCircle from '@lucide/svelte/icons/help-circle';
	import Highlighter from '@lucide/svelte/icons/highlighter';
	import History from '@lucide/svelte/icons/history';
	import Home from '@lucide/svelte/icons/home';
	import Info from '@lucide/svelte/icons/info';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import Leaf from '@lucide/svelte/icons/leaf';
	import Lightbulb from '@lucide/svelte/icons/lightbulb';
	import Lock from '@lucide/svelte/icons/lock';
	import Mail from '@lucide/svelte/icons/mail';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Menu from '@lucide/svelte/icons/menu';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Mic from '@lucide/svelte/icons/mic';
	import Minus from '@lucide/svelte/icons/minus';
	import Monitor from '@lucide/svelte/icons/monitor';
	import Moon from '@lucide/svelte/icons/moon';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import PartyPopper from '@lucide/svelte/icons/party-popper';
	import Phone from '@lucide/svelte/icons/phone';
	import Plus from '@lucide/svelte/icons/plus';
	import PlusCircle from '@lucide/svelte/icons/plus-circle';
	import Presentation from '@lucide/svelte/icons/presentation';
	import Receipt from '@lucide/svelte/icons/receipt';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Route from '@lucide/svelte/icons/route';
	import Rss from '@lucide/svelte/icons/rss';
	import SearchX from '@lucide/svelte/icons/search-x';
	import Shield from '@lucide/svelte/icons/shield';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Sliders from '@lucide/svelte/icons/sliders';
	import Speaker from '@lucide/svelte/icons/speaker';
	import Star from '@lucide/svelte/icons/star';
	import Sun from '@lucide/svelte/icons/sun';
	import Tag from '@lucide/svelte/icons/tag';
	import Tornado from '@lucide/svelte/icons/tornado';
	import User from '@lucide/svelte/icons/user';
	import Users from '@lucide/svelte/icons/users';
	import Video from '@lucide/svelte/icons/video';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import Wrench from '@lucide/svelte/icons/wrench';
	import X from '@lucide/svelte/icons/x';
	import Zap from '@lucide/svelte/icons/zap';

	type IconComponent = typeof Phone;

	let {
		name,
		className = '',
		size = '24'
	}: {
		name: string;
		className?: string;
		size?: number | string;
	} = $props();

	// Semantic name (kept stable for every call site) → Lucide component.
	// Names mirror the previous Material Design catalog so no consumer changes.
	const iconMap: Record<string, IconComponent> = {
		// actions
		add: Plus,
		add_circle: PlusCircle,
		remove: Minus,
		check: Check,
		check_circle: CheckCircle,
		task_alt: CheckCircle,
		close: X,
		menu: Menu,
		tune: Sliders,
		restart_alt: RotateCcw,
		search_off: SearchX,
		radio_button_unchecked: Circle,
		// navigation / arrows
		arrow_forward: ArrowRight,
		arrow_outward: ArrowUpRight,
		chevron_left: ChevronLeft,
		chevron_right: ChevronRight,
		expand_more: ChevronDown,
		explore: Compass,
		home: Home,
		route: Route,
		// communication
		call: Phone,
		phone: Phone,
		mail: Mail,
		email: Mail,
		chat: MessageSquare,
		comments: MessageSquare,
		location_on: MapPin,
		schedule: Clock,
		history: History,
		website: Globe,
		robots: Bot,
		// people
		person: User,
		account_circle: CircleUser,
		group: Users,
		groups: Users,
		co_present: Presentation,
		support_agent: Headset,
		// theme toggle
		light_mode: Sun,
		dark_mode: Moon,
		// business / commerce
		business: Building2,
		business_center: Briefcase,
		corporate_fare: Building2,
		payments: CreditCard,
		request_quote: Receipt,
		// equipment / media
		build: Wrench,
		engineering: HardHat,
		inventory_2: Box,
		package_2: Box,
		memory: Cpu,
		desktop_windows: Monitor,
		speaker: Speaker,
		volume_up: Volume2,
		mic: Mic,
		videocam: Video,
		lightbulb: Lightbulb,
		highlight: Highlighter,
		// content / blog
		article: Newspaper,
		description: FileText,
		folder: Folder,
		label: Tag,
		sell: Tag,
		rss_feed: Rss,
		grid_view: LayoutGrid,
		// trust / legal
		shield: Shield,
		verified_user: ShieldCheck,
		lock: Lock,
		gavel: Gavel,
		policy: FileCheck,
		cookie: Cookie,
		flag: Flag,
		info: Info,
		help: HelpCircle,
		// values / misc
		eco: Leaf,
		cyclone: Tornado,
		favorite: Heart,
		celebration: PartyPopper,
		star: Star,
		star_border: Star,
		zap: Zap
	};

	let ActiveIcon = $derived(iconMap[name] ?? Box);
	// Lucide icons are stroke-based outlines. Filled rating stars carry meaning
	// (full vs empty score), so only `star` gets a solid fill.
	let fill = $derived(name === 'star' ? 'currentColor' : 'none');
</script>

<ActiveIcon
	class={`inline-block select-none shrink-0 ${className}`}
	{size}
	{fill}
	aria-hidden="true"
/>
