// frontend/app/page.tsx
import { supabase } from "../lib/supabase";

// Supabase fetches the data on the server before the page loads
export default async function Home() {
  // Fetch hustlers AND all their listings (which now includes the image_url!)
  const { data: hustlers, error } = await supabase
    .from("hustlers")
    .select("*, listings(*)");

  if (error) {
    console.error("Error fetching hustlers:", error);
    return <div>Error loading marketplace data.</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Local Hustlers Marketplace
          </h1>
          {/* Add a quick link to the dashboard for easy navigation */}
          <a
            href="/dashboard"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Store Login
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hustlers?.map((hustler) => (
            <div
              key={hustler.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-100 pb-2">
                  {hustler.store_name}
                </h2>

                <div className="mt-3 text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium text-gray-900">Owner:</span>{" "}
                    {hustler.owner_name}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Category:</span>{" "}
                    {hustler.category}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">City:</span>{" "}
                    {hustler.city}
                  </p>
                </div>

                {/* Products Sub-section */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Products Available
                  </h3>

                  {hustler.listings && hustler.listings.length > 0 ? (
                    <ul className="space-y-3">
                      {hustler.listings.map((item: any) => (
                        <li
                          key={item.id}
                          className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex gap-4 items-center"
                        >
                          {/* NEW: Render the Image on the public card! */}
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-14 h-14 object-cover rounded-md border border-gray-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gray-200 rounded-md border border-gray-200 flex items-center justify-center text-xs text-gray-400">
                              No Photo
                            </div>
                          )}

                          <div className="flex-1 flex justify-between items-center">
                            <span className="text-gray-800 font-medium">
                              {item.title}
                            </span>
                            <span className="text-green-600 font-bold">
                              ₹{item.price}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No products listed yet.
                    </p>
                  )}
                </div>
              </div>

              <a
                href={`https://wa.me/${hustler.whatsapp_number?.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block text-center w-full bg-green-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                WhatsApp {hustler.owner_name}
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
