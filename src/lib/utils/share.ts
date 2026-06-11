export interface ShareLink {
	name: string;
	href: string;
	icon: string;
	color: string;
	bgClass: string;
}

export function getShareLinks(url: string, title: string, coverImage?: string): ShareLink[] {
	const encodedUrl = encodeURIComponent(url);
	const encodedTitle = encodeURIComponent(title);
	const encodedCover = coverImage ? encodeURIComponent(coverImage) : '';

	return [
		{
			name: 'WhatsApp',
			href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
			icon: 'whatsapp',
			color: 'hover:bg-[#25D366] hover:text-white',
			bgClass: 'bg-[#25D366]/10 text-[#25D366]'
		},
		{
			name: 'Facebook',
			href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
			icon: 'facebook',
			color: 'hover:bg-[#1877F2] hover:text-white',
			bgClass: 'bg-[#1877F2]/10 text-[#1877F2]'
		},
		{
			name: 'Twitter',
			href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
			icon: 'twitter',
			color: 'hover:bg-[#000000] hover:text-white',
			bgClass: 'bg-white/10 text-white'
		},
		{
			name: 'Pinterest',
			href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}${encodedCover ? '&media=' + encodedCover : ''}`,
			icon: 'pinterest',
			color: 'hover:bg-[#BD081C] hover:text-white',
			bgClass: 'bg-[#BD081C]/10 text-[#BD081C]'
		},
		{
			name: 'LinkedIn',
			href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
			icon: 'linkedin',
			color: 'hover:bg-[#0A66C2] hover:text-white',
			bgClass: 'bg-[#0A66C2]/10 text-[#0A66C2]'
		},
		{
			name: 'Email',
			href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
			icon: 'email',
			color: 'hover:bg-[#4D8CFF] hover:text-white',
			bgClass: 'bg-[#4D8CFF]/10 text-[#4D8CFF]'
		}
	];
}
