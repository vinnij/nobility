import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
	{ id: 'admin:read', title: 'Admin Access', description: 'Access the admin panel', resource: 'admin', action: 'read' },

	{ id: 'user:manage', title: 'Manage Users', description: 'Manage users information', resource: 'user', action: 'manage' },
	{ id: 'user_linked:read', title: 'View Linked Accounts', description: 'View linked accounts', resource: 'user_linked', action: 'read' },
	{ id: 'user_full:read', title: 'View Full User Details', description: 'View full user details, including transactions.', resource: 'user_full', action: 'read' },
	{ id: 'user_store:grant', title: 'Grant Store Packages', description: 'Grant store packages to users', resource: 'user_grant', action: 'create' },

	{ id: 'servers:manage', title: 'Manage Servers', description: 'Manage game servers', resource: 'servers', action: 'manage' },
	{ id: 'mapvoting:manage', title: 'Manage Map Voting', description: 'Manage map voting', resource: 'mapvoting', action: 'manage' },

	{ id: 'tickets:read', title: 'View Tickets', description: 'View support tickets', resource: 'tickets', action: 'read' },
	{ id: 'tickets:manage', title: 'Manage Tickets', description: 'Manage support tickets', resource: 'tickets', action: 'manage' },

	{ id: 'logs:read', title: 'View Logs', description: 'View Admin Logs', resource: 'logs', action: 'read' },
	{ id: 'leaderboard:manage', title: 'Manage Leaderboard', description: 'Manage leaderboard settings', resource: 'leaderboard', action: 'manage' },
	{ id: 'seo:manage', title: 'Manage SEO', description: 'Manage SEO settings', resource: 'seo', action: 'manage' },
	{ id: 'settings:manage', title: 'Manage Settings', description: 'Manage site settings', resource: 'settings', action: 'manage' },
	{ id: 'settings_roles:manage', title: 'Manage Roles', description: 'Manage roles and their permissions', resource: 'settings_roles', action: 'manage' },
]

const roles = [
	{
		name: "Admin",
		color: "#cc1f1f",
		// This will grant all permissions to the user
		permissions: permissions.map(permission => {
			return {
				id: permission.id,
				title: permission.title,
				description: permission.description,
				resource: permission.resource,
				action: permission.action,
			}
		})
	},
];

// Update these values to match your site
const siteSettings = {
	name: "Noble Rust Template",
	// storeId: "327517860240822272", // Change this to your paynow store Id or leave it commented
	ownerId: "76561198387660592", // Change this to the steam id of the owner
	discordInvite: "https://discord.gg/ArWvQaYFfx", // Optional
	steamGroupId: "45164041", // Optional
	steamGroupUrl: "https://steamcommunity.com/groups/nobledev", // Optional
}

const discordIntegration = {
	guildId: "742378389788426330",
	webhookUrl: "https://discord.com/api/webhooks/xx/xx", // Optional
	verificationHookColor: "2105893", // Optional
}

const leaderboardData = {
	leaderboardTabs: [
		{
			tabKey: "pvp_stats",
			tabLabel: "PVP",
			order: 1,
			columns: [
				{ columnKey: "kills", columnLabel: "Kills", order: 1 },
				{ columnKey: "deaths", columnLabel: "Deaths", order: 2 },
				{ columnKey: "kdr", columnLabel: "KDR", order: 3 },
				{ columnKey: "headshots", columnLabel: "Headshots", order: 4 },
				{ columnKey: "suicides", columnLabel: "Suicides", order: 5 },
				{ columnKey: "bullets_fired", columnLabel: "Bullets Fired", order: 6 }
			]
		},
		{
			tabKey: "resources_stats",
			tabLabel: "Resources",
			order: 2,
			columns: [
				{ columnKey: "hqm_farmed", columnLabel: "HQM Farmed", order: 1 },
				{ columnKey: "metal_frags_farmed", columnLabel: "Metal Frags Farmed", order: 2 },
				{ columnKey: "stone_farmed", columnLabel: "Stone Farmed", order: 3 },
				{ columnKey: "sulfur_farmed", columnLabel: "Sulfur Farmed", order: 4 },
				{ columnKey: "wood_farmed", columnLabel: "Wood Farmed", order: 5 }
			]
		},
		{
			tabKey: "explosives_stats",
			tabLabel: "Explosives",
			order: 3,
			columns: [
				{ columnKey: "satches_thrown", columnLabel: "Satchels Thrown", order: 1 },
				{ columnKey: "c4_thrown", columnLabel: "C4 Thrown", order: 2 },
				{ columnKey: "he_grenades_fired", columnLabel: "HE Grenades Fired", order: 3 },
				{ columnKey: "rockets_fired", columnLabel: "Rockets Fired", order: 4 },
				{ columnKey: "hv_rockets_fired", columnLabel: "HV Rockets Fired", order: 5 },
				{ columnKey: "incendiary_rockets_fired", columnLabel: "Incendiary Rockets Fired", order: 6 },
				{ columnKey: "smoke_rockets_fired", columnLabel: "Smoke Rockets Fired", order: 7 }
			]
		},
		{
			tabKey: "farming_stats",
			tabLabel: "Farming",
			order: 4,
			columns: [
				{ columnKey: "leather_harvested", columnLabel: "Leather Harvested", order: 1 },
				{ columnKey: "berries_harvested", columnLabel: "Berries Harvested", order: 2 },
				{ columnKey: "cloth_collected", columnLabel: "Cloth Collected", order: 3 },
				{ columnKey: "corn_harvested", columnLabel: "Corn Harvested", order: 4 },
				{ columnKey: "fish_gutted", columnLabel: "Fish Gutted", order: 5 },
				{ columnKey: "mushrooms_harvested", columnLabel: "Mushrooms Harvested", order: 6 },
				{ columnKey: "potatoes_harvested", columnLabel: "Potatoes Harvested", order: 7 },
				{ columnKey: "pumpkins_harvested", columnLabel: "Pumpkins Harvested", order: 8 }
			]
		},
		{
			tabKey: "misc_stats",
			tabLabel: "Misc",
			order: 5,
			columns: [
				{ columnKey: "time_played", columnLabel: "Time Played", order: 1 },
				{ columnKey: "animal_kills", columnLabel: "Animal Kills", order: 2 },
				{ columnKey: "boats_purchased", columnLabel: "Boats Purchased", order: 3 },
				{ columnKey: "helis_purchased", columnLabel: "Helicopters Purchased", order: 4 },
				{ columnKey: "subs_purchased", columnLabel: "Submarines Purchased", order: 5 },
				{ columnKey: "supply_signals_called", columnLabel: "Supply Signals Called", order: 6 }
			]
		},
		{
			tabKey: "events_stats",
			tabLabel: "Events",
			order: 6,
			columns: [
				{ columnKey: "hacked_crates_looted", columnLabel: "Hacked Crates Looted", order: 1 },
				{ columnKey: "heli_kills", columnLabel: "Heli Kills", order: 2 },
				{ columnKey: "bradley_kills", columnLabel: "Bradley Kills", order: 3 },
				{ columnKey: "missions_started", columnLabel: "Missions Started", order: 4 },
				{ columnKey: "missions_completed", columnLabel: "Missions Completed", order: 5 },
				{ columnKey: "npc_kills", columnLabel: "NPC Kills", order: 6 }
			]
		}
	]
};

const seoData = {
	pageMetadata: [
		{
			slug: "home",
			title: "Home Page - Welcome to Our Site",
			description: "The home page of our site, featuring an overview of our offerings.",
			keywords: "home, welcome, overview",
			ogTitle: "Welcome to Our Site",
			ogDescription: "Explore our site and learn more about what we offer.",
			ogImageUrl: "https://yourwebsite.com/images/home-og-image.jpg",
			ogImageAlt: "Home Page Image",
			twitterTitle: "Welcome to Our Site",
			twitterDescription: "Explore our site and learn more about what we offer.",
			twitterImageUrl: "https://yourwebsite.com/images/home-twitter-image.jpg"
		},
		{
			slug: "leaderboard",
			title: "Leaderboard - Rust Server Player Statistics",
			description: "View player statistics and rankings for our Rust servers.",
			keywords: "leaderboard, rust, player statistics",
			ogTitle: "Rust Server Leaderboard",
			ogDescription: "See the top players and their stats on our Rust servers.",
			ogImageUrl: "https://yourwebsite.com/images/leaderboard-og-image.jpg",
			ogImageAlt: "Leaderboard Image",
			twitterTitle: "Rust Server Leaderboard",
			twitterDescription: "Check out the top Rust players and their stats.",
			twitterImageUrl: "https://yourwebsite.com/images/leaderboard-twitter-image.jpg"
		},
		{
			slug: "servers",
			title: "Servers - List of All Rust Servers",
			description: "Browse the list of all available Rust servers.",
			keywords: "servers, rust, server list",
			ogTitle: "All Rust Servers",
			ogDescription: "Find and explore all our Rust servers here.",
			ogImageUrl: "https://yourwebsite.com/images/servers-og-image.jpg",
			ogImageAlt: "Servers Image",
			twitterTitle: "All Rust Servers",
			twitterDescription: "Explore our full list of Rust servers.",
			twitterImageUrl: "https://yourwebsite.com/images/servers-twitter-image.jpg"
		},
		{
			slug: "store",
			title: "Store - Purchasable Packages and In-Game Items",
			description: "Browse and purchase packages and in-game items.",
			keywords: "store, packages, in-game items",
			ogTitle: "Store - Packages and Items",
			ogDescription: "Check out our store for packages and in-game items you can purchase.",
			ogImageUrl: "https://yourwebsite.com/images/store-og-image.jpg",
			ogImageAlt: "Store Image",
			twitterTitle: "Store - Packages and Items",
			twitterDescription: "Find packages and in-game items in our store.",
			twitterImageUrl: "https://yourwebsite.com/images/store-twitter-image.jpg"
		},
		{
			slug: "support",
			title: "Support - Get Help with Your Issues",
			description: "Submit and track support tickets for any issues you encounter.",
			keywords: "support, help, tickets, customer service",
			ogTitle: "Support Center",
			ogDescription: "Get assistance and submit support tickets for any problems you're facing.",
			ogImageUrl: "https://yourwebsite.com/images/support-og-image.jpg",
			ogImageAlt: "Support Center Image",
			twitterTitle: "Support Center",
			twitterDescription: "Need help? Submit a support ticket and we'll assist you.",
			twitterImageUrl: "https://yourwebsite.com/images/support-twitter-image.jpg"
		},
		{
			slug: "maps",
			title: "Map Voting - Choose the Next Rust Map",
			description: "Vote for your favorite Rust maps and influence the next server rotation.",
			keywords: "maps, voting, rust maps, server rotation",
			ogTitle: "Vote for Rust Maps",
			ogDescription: "Participate in map voting and help decide the next Rust server map.",
			ogImageUrl: "https://yourwebsite.com/images/maps-og-image.jpg",
			ogImageAlt: "Map Voting Image",
			twitterTitle: "Vote for Rust Maps",
			twitterDescription: "Cast your vote and influence the next Rust server map rotation.",
			twitterImageUrl: "https://yourwebsite.com/images/maps-twitter-image.jpg"
		},
		{
			slug: "profile",
			title: "User Profile - Manage Your Account",
			description: "View and manage your account settings.",
			keywords: "profile, user account, settings, stats",
			ogTitle: "Your Rust Player Profile",
			ogDescription: "View and manage your account settings.",
			ogImageUrl: "https://yourwebsite.com/images/profile-og-image.jpg",
			ogImageAlt: "User Profile Image",
			twitterTitle: "Your Rust Player Profile",
			twitterDescription: "View and manage your account settings.",
			twitterImageUrl: "https://yourwebsite.com/images/profile-twitter-image.jpg"
		}
	]
};

// Navigation Items
const navigationItems = [
	{ label: "Home", url: "/", order: 0 },
	{ label: "Leaderboard", url: "/leaderboard", order: 1 },
	{ label: "Servers", url: "/servers", order: 2 },
	{ label: "Maps", url: "/maps", order: 3 },
	{ label: "Link", url: "/link", order: 4 },
	{ label: "Support", url: "/support", order: 5 },
	{ label: "Store", url: "/store", order: 6 },
];

async function main() {
	console.log('Seeding data...');
	// Seed leaderboard data
	console.log('Seeding leaderboard data...');
	for (const tab of leaderboardData.leaderboardTabs) {
		await prisma.leaderboardTab.upsert({
			where: { tabKey: tab.tabKey },
			update: {
				tabLabel: tab.tabLabel,
				order: tab.order,
				columns: {
					deleteMany: {},
					create: tab.columns.map((column) => ({
						columnKey: column.columnKey,
						columnLabel: column.columnLabel,
						order: column.order,
					})),
				},
			},
			create: {
				tabKey: tab.tabKey,
				tabLabel: tab.tabLabel,
				order: tab.order,
				columns: {
					create: tab.columns.map((column) => ({
						columnKey: column.columnKey,
						columnLabel: column.columnLabel,
						order: column.order,
					})),
				},
			},
		});
	}

	// Seed SEO data
	console.log('Seeding SEO data...');
	for (const page of seoData.pageMetadata) {
		await prisma.pageMetadata.upsert({
			where: { slug: page.slug },
			update: {
				title: page.title,
				description: page.description,
				keywords: page.keywords,
				ogTitle: page.ogTitle,
				ogDescription: page.ogDescription,
				ogImageUrl: page.ogImageUrl,
				ogImageAlt: page.ogImageAlt,
				twitterTitle: page.twitterTitle,
				twitterDescription: page.twitterDescription,
				twitterImageUrl: page.twitterImageUrl,
			},
			create: {
				slug: page.slug,
				title: page.title,
				description: page.description,
				keywords: page.keywords,
				ogTitle: page.ogTitle,
				ogDescription: page.ogDescription,
				ogImageUrl: page.ogImageUrl,
				ogImageAlt: page.ogImageAlt,
				twitterTitle: page.twitterTitle,
				twitterDescription: page.twitterDescription,
				twitterImageUrl: page.twitterImageUrl,
			},
		});
	}

	console.log('Seeding navigation items...');
	for (const item of navigationItems) {
		await prisma.navigationItem.upsert({
			where: {
				label_url: {
					label: item.label,
					url: item.url
				}
			},
			update: item,
			create: item,
		});
	}

	console.log('Seeding site settings...');
	await prisma.siteSettings.upsert({
		where: { id: 1 },
		update: siteSettings,
		create: siteSettings,
	});

	console.log('Seeding discord integration...');
	await prisma.discordIntegration.upsert({
		where: { id: 1 },
		update: discordIntegration,
		create: discordIntegration,
	});

	console.log('Seeding permissions...');
	for (const permission of permissions) {
		await prisma.permission.upsert({
			where: { id: permission.id },
			create: permission,
			update: permission,
		});
	}

	console.log('Seeding roles...');
	for (const role of roles) {
		const { permissions, ...roleData } = role;
		const updatedRole = await prisma.role.upsert({
			where: { name: role.name },
			update: roleData,
			create: roleData
		});

		for (const permission of permissions) {
			await prisma.rolePermission.upsert({
				where: {
					roleId_permissionId: {
						roleId: updatedRole.id,
						permissionId: permission.id
					}
				},
				create: {
					roleId: updatedRole.id,
					permissionId: permission.id
				},
				update: {
					roleId: updatedRole.id,
					permissionId: permission.id
				}
			})
		}
	}
}

main()
	.catch(e => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});