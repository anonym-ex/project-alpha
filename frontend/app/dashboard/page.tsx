// frontend/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);

  // Store Form State
  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [category, setCategory] = useState("Food & Baking");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Product Form State
  const [productTitle, setProductTitle] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      const { data: existingStore } = await supabase
        .from("hustlers")
        .select("*, listings(*)")
        .eq("user_id", session.user.id)
        .single();

      if (existingStore) setStore(existingStore);
      setLoading(false);
    };
    fetchUserData();
  }, [router]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data, error } = await supabase
      .from("hustlers")
      .insert([
        {
          store_name: storeName,
          owner_name: ownerName,
          category: category,
          city: city,
          whatsapp_number: whatsapp,
          user_id: user.id,
        },
      ])
      .select("*, listings(*)")
      .single();

    if (error) {
      alert(`Error creating store: ${error.message}`);
    } else {
      setStore(data);
    }
    setSaving(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingProduct(true);

    let imageUrl = null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${store.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        alert(`Image upload failed: ${uploadError.message}`);
        setAddingProduct(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("listings")
      .insert([
        {
          title: productTitle,
          price: parseFloat(productPrice),
          hustler_id: store.id,
          image_url: imageUrl,
        },
      ])
      .select()
      .single();

    if (error) {
      alert(`Error adding product: ${error.message}`);
    } else {
      setProductTitle("");
      setProductPrice("");
      setImageFile(null);

      const fileInput = document.getElementById(
        "image-upload",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      setStore({ ...store, listings: [...(store.listings || []), data] });
    }
    setAddingProduct(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        Loading...
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Store Dashboard</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-red-600 font-medium hover:underline"
          >
            Sign Out
          </button>
        </div>

        {store ? (
          /* ACTIVE STORE VIEW */
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 p-8 rounded-xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-green-900 mb-1">
                  {store.store_name} is Live!
                </h2>
                <p className="text-green-800 text-sm">
                  Your store is visible on the main marketplace.
                </p>
              </div>
              <a
                href="/"
                className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium shadow-sm border border-green-200"
              >
                View Public Page
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Add New Product
                </h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Product Title
                    </label>
                    <input
                      type="text"
                      required
                      value={productTitle}
                      onChange={(e) => setProductTitle(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Product Photo
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setImageFile(e.target.files ? e.target.files[0] : null)
                      }
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={addingProduct}
                    className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg disabled:opacity-50"
                  >
                    {addingProduct ? "Uploading..." : "Add to Display Case"}
                  </button>
                </form>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold mb-4">Your Display Case</h3>
                {store.listings && store.listings.length > 0 ? (
                  <ul className="space-y-3">
                    {store.listings.map((item: any) => (
                      <li
                        key={item.id}
                        className="bg-gray-50 p-3 rounded-lg border flex gap-4 items-center"
                      >
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded-md border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-md border flex items-center justify-center text-xs text-gray-400">
                            No Img
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">
                            {item.title}
                          </p>
                          <p className="text-green-600 font-bold text-sm">
                            ₹{item.price}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-lg">
                    <p className="text-gray-400">Your shelves are empty.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ONBOARDING FORM */
          <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Create Your Hustler Profile
            </h2>
            <form onSubmit={handleCreateStore} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option>Food & Baking</option>
                  <option>Arts & Crafts</option>
                  <option>Services</option>
                  <option>Electronics</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white font-medium py-2 mt-4 rounded-lg"
              >
                Launch Store
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
