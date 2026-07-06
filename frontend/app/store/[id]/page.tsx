// frontend/app/store/[id]/page.tsx
import { supabase } from "../../../lib/supabase";
import Image from "next/image";

// frontend/app/store/[id]/page.tsx

// ... (your supabase import at the top)

// === DYNAMIC SEO METADATA ===
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { data: store } = await supabase
    .from("hustlers")
    .select("store_name, category, city, owner_name")
    .eq("id", resolvedParams.id)
    .single();

  if (!store) {
    return { title: "Store Not Found | Hustlers Marketplace" };
  }

  // This tells Google, Twitter, and iMessage exactly how to display the link preview!
  return {
    title: `${store.store_name} | Buy Local in ${store.city}`,
    description: `Shop the best local ${store.category} products from ${store.owner_name} on the Hustlers Marketplace.`,
    openGraph: {
      title: store.store_name,
      description: `Support local business in ${store.city}!`,
      type: "website",
    },
  };
}

// NEW: We updated the params type to handle Next.js 15 changes
export default async function StoreProfile({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Safely unwrap the ID from the URL (Fixes Next.js 14/15 compatibility)
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const { data: store, error } = await supabase
    .from("hustlers")
    .select("*, listings(*)")
    .eq("id", id)
    .single();

  // THE DEBUGGER: If it fails, print exactly WHY it failed
  if (!store || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Store not found.
        </h1>
        <p className="text-gray-600 mb-6">
          We tried to look for a store with the ID:{" "}
          <strong className="text-black">{id}</strong>
        </p>

        {/* This box will print the exact database error */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-600 text-left max-w-lg w-full font-mono text-sm shadow-sm">
            <strong>Supabase Error:</strong>
            <br />
            {error.message}
            <br />
            <span className="text-xs text-red-400">
              Code: {error.code} | Details: {error.details}
            </span>
          </div>
        )}

        <a href="/" className="mt-8 text-blue-600 hover:underline font-medium">
          &larr; Back to Marketplace
        </a>
      </div>
    );
  }

  // === IF SUCCESSFUL, RENDER THE STORE (Unchanged) ===
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <a
          href="/"
          className="text-blue-600 hover:underline mb-6 inline-block font-medium"
        >
          &larr; Back to Marketplace
        </a>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {store.store_name}
              </h1>
              <p className="text-gray-600 text-lg">
                Owned by{" "}
                <span className="font-semibold text-gray-900">
                  {store.owner_name}
                </span>
              </p>
              <p className="text-gray-500 mt-1">
                {store.city} • {store.category}
              </p>
            </div>
            <a
              href={`https://wa.me/${store.whatsapp_number?.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-sm"
            >
              WhatsApp {store.owner_name}
            </a>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Available Products
        </h2>

        {store.listings && store.listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {store.listings.map((item: any) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col"
              >
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    width={56}
                    height={56}
                    className="w-14 h-14 object-cover rounded-md border"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                    No Photo
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-2xl text-green-600 font-black">
                    ₹{item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
            This store hasn't added any products yet.
          </div>
        )}
      </div>
    </main>
  );
}
