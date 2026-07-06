// frontend/app/page.tsx
"use client";
import Image from "next/image";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [hustlers, setHustlers] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Discovery Engine State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = [
    "All",
    "Food & Baking",
    "Arts & Crafts",
    "Services",
    "Electronics",
  ];

  // Intent Capture State
  const [pendingFavoriteId, setPendingFavoriteId] = useState<number | null>(
    null,
  );
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase.from("hustlers").select("*, listings(*)");
      if (data) setHustlers(data);
      setLoading(false);
    };
    fetchStores();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: favData } = await supabase
          .from("favorites")
          .select("listing_id")
          .eq("user_id", currentUser.id);
        if (favData) setFavorites(favData.map((f: any) => f.listing_id));
      } else {
        setFavorites([]);
        setIsDrawerOpen(false); // Close drawer if they log out
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && pendingFavoriteId !== null) {
      const executeTrappedIntent = async () => {
        await supabase
          .from("favorites")
          .insert([{ user_id: user.id, listing_id: pendingFavoriteId }]);
        setFavorites((prev) =>
          prev.includes(pendingFavoriteId)
            ? prev
            : [...prev, pendingFavoriteId],
        );
        setPendingFavoriteId(null);
        setShowAuthModal(false);
      };
      executeTrappedIntent();
    }
  }, [user, pendingFavoriteId]);

  const toggleFavorite = async (listingId: number) => {
    if (!user) {
      setPendingFavoriteId(listingId);
      setShowAuthModal(true);
      return;
    }
    const isAlreadyFav = favorites.includes(listingId);
    if (isAlreadyFav) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);
      setFavorites(favorites.filter((id) => id !== listingId));
    } else {
      await supabase
        .from("favorites")
        .insert([{ user_id: user.id, listing_id: listingId }]);
      setFavorites([...favorites, listingId]);
    }
  };

  const handleModalAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    const { error } = isLoginMode
      ? await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        })
      : await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });

    if (error) setAuthError(error.message);
    setAuthLoading(false);
  };

  // === DATA COMPUTATION ===
  // Gather the actual product data (photos, titles) for the items in the user's favorites array!
  const favoriteProducts = hustlers.reduce((acc: any[], hustler) => {
    const favoritedInStore = (hustler.listings || [])
      .filter((item: any) => favorites.includes(item.id))
      .map((item: any) => ({
        ...item,
        store_name: hustler.store_name,
        hustler_id: hustler.id,
      }));
    return [...acc, ...favoritedInStore];
  }, []);

  const filteredHustlers = hustlers.filter((hustler) => {
    const matchesSearch =
      hustler.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hustler.owner_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || hustler.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Loading marketplace...
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 p-8 relative overflow-hidden">
      {/* THE LOGIN MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => {
                setShowAuthModal(false);
                setPendingFavoriteId(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Save your favorites
            </h2>
            <p className="text-gray-600 mb-6">
              Create an account or log in to save items you love.
            </p>
            {authError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {authError}
              </div>
            )}
            <form onSubmit={handleModalAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg"
              >
                {authLoading ? "Wait..." : isLoginMode ? "Log In" : "Sign Up"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-600 mt-6">
              {isLoginMode
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-blue-600 font-medium hover:underline"
              >
                {isLoginMode ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* === THE SAVED ITEMS DRAWER === */}
      {/* 1. The dark background overlay that clicks to close */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* 2. The Sliding White Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-gray-900">Your Saved Items</h2>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="text-3xl text-gray-400 hover:text-gray-800 leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {favoriteProducts.length > 0 ? (
            favoriteProducts.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4 relative group"
              >
                {item.image_url && item.image_url.startsWith("http") ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    width={56}
                    height={56}
                    className="w-14 h-14 object-cover rounded-md border border-gray-200"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-200 rounded-md border border-gray-200 flex items-center justify-center text-xs text-gray-400">
                    No Img
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 leading-tight mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">
                    from{" "}
                    <a
                      href={`/store/${item.hustler_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {item.store_name}
                    </a>
                  </p>
                  <p className="text-green-600 font-bold text-sm">
                    ₹{item.price}
                  </p>
                </div>
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-red-500 transition"
                  title="Remove from saved"
                >
                  &times;
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <span className="text-5xl">🤍</span>
              <p className="text-center">You haven't saved any items yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* MARKETPLACE CONTENT */}
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Local Hustlers Marketplace
          </h1>

          {/* UPDATED HEADER BUTTONS */}
          <div className="flex items-center gap-4">
            {user && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2 text-gray-700 font-medium hover:text-red-600 transition bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
              >
                Saved{" "}
                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                  {favorites.length}
                </span>
              </button>
            )}
            <a
              href="/dashboard"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition shadow-sm"
            >
              {user ? "Store Dashboard" : "Store Login"}
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search by store or owner name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredHustlers.length > 0 ? (
            filteredHustlers.map((hustler) => (
              <div
                key={hustler.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start border-b pb-3 mb-3">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {hustler.store_name}
                    </h2>
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
                      {hustler.category}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-6">
                    <p>
                      <span className="font-medium text-gray-900">Owner:</span>{" "}
                      {hustler.owner_name}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">City:</span>{" "}
                      {hustler.city}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Products
                    </h3>
                    {hustler.listings && hustler.listings.length > 0 ? (
                      <ul className="space-y-3">
                        {hustler.listings.map((item: any) => (
                          <li
                            key={item.id}
                            className="bg-gray-50 p-3 rounded-lg border flex gap-4 items-center relative group"
                          >
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-14 h-14 object-cover rounded-md border"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-400">
                                No Photo
                              </div>
                            )}
                            <div className="flex-1 flex justify-between items-center pr-10">
                              <span className="text-gray-800 font-medium">
                                {item.title}
                              </span>
                              <span className="text-green-600 font-bold">
                                ₹{item.price}
                              </span>
                            </div>

                            <button
                              onClick={() => toggleFavorite(item.id)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl transition hover:scale-110 outline-none"
                            >
                              {favorites.includes(item.id) ? "❤️" : "🤍"}
                            </button>
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
                  href={`/store/${hustler.id}`}
                  className="mt-6 block text-center w-full bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Visit Store Profile
                </a>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
              No stores found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
