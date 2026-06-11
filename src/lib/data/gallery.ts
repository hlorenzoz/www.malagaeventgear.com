export interface GalleryImage {
	src: string;
	alt: string;
	category: 'wedding' | 'corporate' | 'general' | 'party';
}

export const galleryImages: GalleryImage[] = [
	// Wedding
	{
		src: 'https://cdn.malagaeventgear.com/blog/1638/wedding_rings_heart_book-600x400.webp',
		alt: 'Wedding ceremony details',
		category: 'wedding'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1632/wedding_reception_decor-600x375.webp',
		alt: 'Elegant wedding reception decor',
		category: 'wedding'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1625/beach_wedding_table_decor-600x400.webp',
		alt: 'Beach wedding table setup and decoration',
		category: 'wedding'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1631/wedding_table_setting-600x400.webp',
		alt: 'Romantic wedding table setting',
		category: 'wedding'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1628/evening_wedding_reception_table-600x400.webp',
		alt: 'Evening wedding dinner table with soft lighting',
		category: 'wedding'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1629/beach_wedding_setup-600x400.webp',
		alt: 'Beautiful beach wedding ceremonial setup',
		category: 'wedding'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1635/indoor_wedding_ceremony_hall-600x400.webp',
		alt: 'Indoor wedding ceremony hall setup',
		category: 'wedding'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1630/tropical_beach_wedding-600x400.webp',
		alt: 'Tropical beach wedding ceremonial arch',
		category: 'wedding'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1636/tropical_beach_wedding_aisle-600x400.webp',
		alt: 'Tropical beach wedding aisle with chairs',
		category: 'wedding'
	},

	// Corporate / MICE
	{
		src: 'https://cdn.malagaeventgear.com/blog/1313/corporate-event-600x401.webp',
		alt: 'Corporate event lighting and stage setup',
		category: 'corporate'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1282/malaga_international_event_av_rental-scaled-600x448.webp',
		alt: 'Malaga international event AV rental system',
		category: 'corporate'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/2278/audio-visual-rental-for-virtual-events-in-Malaga-1-600x401.webp',
		alt: 'Audio visual setup for virtual and hybrid events',
		category: 'corporate'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1284/colegio_oficial_gestores_administrativos_malaga_audio_rental_1-scaled-600x448.webp',
		alt: 'Official association meeting audio rental',
		category: 'corporate'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/2495/7-years-on-the-Neighborhood-Council-Community-Meeting-600x450.webp',
		alt: 'Community meeting sound setup',
		category: 'corporate'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1331/malaga_mice_event_audio_lighting_podium_rental-600x449.webp',
		alt: 'MICE event audio and lighting on stage',
		category: 'corporate'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1276/malaga_congress_sound_system_rental-scaled-600x448.webp',
		alt: 'Large scale congress sound system rental',
		category: 'corporate'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1269/hotel_alfonso_xiii_congress_stage-scaled-600x448.webp',
		alt: 'Hotel Alfonso XIII congress stage setup',
		category: 'corporate'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1267/volvo_mice_event_setup_1-scaled-600x448.webp',
		alt: 'Volvo corporate event MICE AV setup',
		category: 'corporate'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1261/methacrylate_lectern_outdoor_event-600x448.webp',
		alt: 'Methacrylate lectern at outdoor event',
		category: 'corporate'
	},

	// General / Sound / Lighting / Party / FX
	{
		src: 'https://cdn.malagaeventgear.com/blog/1292/malaga_event_lighting_display_projector_sound_rental_3-scaled-600x448.webp',
		alt: 'Professional display, projector, sound system rental',
		category: 'general'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1297/malaga_event_lighting_sound_system_rental_2-scaled-600x448.webp',
		alt: 'Stunning event lighting and sound installation',
		category: 'general'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1301/lighting-sound-big-screen-projector-rental-malaga_1-600x450.webp',
		alt: 'Lighting and sound for event screen',
		category: 'general'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1195/sound-system-tennis-championship-2024-setup-600x338.webp',
		alt: 'Tennis championship sports sound setup',
		category: 'general'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1191/billie-jean-king-cup-2024-celebration-lights-sound-600x450.webp',
		alt: 'Sports cup celebration lights and sound',
		category: 'general'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1788/2025-10-05-DJ-audio-and-microphone-system-setup-600x450.webp',
		alt: 'DJ audio and microphone system setup',
		category: 'general'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1289/malaga_event_lighting_display_projector_sound_rental_1-scaled-600x448.webp',
		alt: 'Professional event lighting and projector screen',
		category: 'general'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1294/malaga_event_lighting_big_display_projector_sound_rental_1-scaled-600x448.webp',
		alt: 'Staging, audio, visual and custom setup',
		category: 'general'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1327/malaga_concert_lighting_microphone_audio_rental-scaled-600x448.webp',
		alt: 'Concert lighting, microphone, and audio rental',
		category: 'general'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1275/malaga_sound_system_rental_outdoor_event-scaled-600x448.webp',
		alt: 'Outdoor party and event sound system rental',
		category: 'general'
	},
	{
		src: 'https://cdn.malagaeventgear.com/blog/1272/malaga_sound_lighting_rental_event-scaled-600x448.webp',
		alt: 'Sound and lighting rental for live band events',
		category: 'general'
	}
];

export function getImagesForPackage(packageId: string): GalleryImage[] {
	if (packageId === 'wedding') {
		return galleryImages.filter((img) => img.category === 'wedding');
	} else if (packageId === 'eco') {
		return galleryImages.filter((img) => img.category === 'general' || img.category === 'party');
	} else {
		// Corporate packs: basic-mice, mice, product-presentation
		return galleryImages.filter((img) => img.category === 'corporate');
	}
}
