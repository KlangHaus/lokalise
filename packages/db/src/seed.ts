import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { user } from "./schema/auth.js";

const connectionString =
	process.env.DATABASE_URL || "postgres://localhost:5432/lokalise";
const apiUrl = process.env.API_URL || "http://localhost:3000";

async function seed() {
	const client = postgres(connectionString);
	const db = drizzle(client);

	console.log("🌱 Seeding database...");

	// Check if superadmin already exists
	const existing = await db
		.select()
		.from(user)
		.where(eq(user.email, "superadmin@lokalise.local"))
		.limit(1);

	if (existing.length > 0) {
		console.log("⚠️  Superadmin already exists, skipping...");
		await client.end();
		return;
	}

	// Create superadmin via Better Auth API
	console.log("📡 Creating superadmin user via Better Auth...");

	try {
		const response = await fetch(`${apiUrl}/api/auth/sign-up/email`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: "superadmin@lokalise.local",
				password: "superadmin",
				name: "Super Admin",
			}),
		});

		if (!response.ok) {
			throw new Error(`API returned ${response.status}: ${await response.text()}`);
		}

		const result = await response.json();
		console.log("✅ Created superadmin user via Better Auth");

		// Set superadmin flag in database
		await db
			.update(user)
			.set({ isSuperAdmin: true })
			.where(eq(user.email, "superadmin@lokalise.local"));

		console.log("✅ Set superadmin flag");
		console.log("\n🎉 Seeding complete!");
		console.log("\nYou can now login with:");
		console.log("   Email: superadmin@lokalise.local");
		console.log("   Password: superadmin");
	} catch (error: any) {
		console.error("❌ Failed to create superadmin:", error.message);
		console.log("\n⚠️  Make sure the API server is running on", apiUrl);
		throw error;
	} finally {
		await client.end();
	}
}

seed().catch((err) => {
	console.error("❌ Seeding failed:", err);
	process.exit(1);
});
