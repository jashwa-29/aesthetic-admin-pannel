import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_URL = "https://aesthetic-backend-5jyv.onrender.com/api/gallery";
const CATEGORY_OPTIONS = [
  "Face",
  "Breast",
  "Body",
  "Medspa",
  "Hair",
  "Cosmetic Gynecology",
];

const GalleryPage = () => {
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");

  const fetchGallery = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGalleryItems(res.data);
    } catch (err) {
      setError("Failed to load gallery");
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!image || !category.trim()) {
      return setError("Both fields are required");
    }

    const formattedCategory = category.toLowerCase().replace(/\s+/g, "");
    const formData = new FormData();
    formData.append("image", image);
    formData.append("category", formattedCategory);

    try {
      setLoading(true);
      await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setCategory("");
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input value
      }
      fetchGallery();
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGalleryItems((prev) => prev.filter((item) => item._id !== deleteId));
    } catch (err) {
      alert("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">🖼️ Gallery Manager</h1>

      {/* Upload Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700 max-w-2xl mb-10 mx-auto"
      >
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-md border dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full text-sm text-gray-600 dark:text-gray-300"
            required
          />
        </div>

        {/* Image preview */}
        {image && (
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-white">Selected Image Preview:</p>
            <img
              src={URL.createObjectURL(image)}
              alt="Selected preview"
              className="w-40 h-40 object-cover rounded-md border dark:border-gray-600"
              onLoad={() => URL.revokeObjectURL(image)} // free memory
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Image"}
        </button>
      </form>

      {/* Gallery Table */}
      <div className="overflow-x-auto shadow rounded-xl border dark:border-gray-700">
        <table className="min-w-full bg-white dark:bg-gray-900 text-sm rounded-xl overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-800 dark:text-white">
                Preview
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-800 dark:text-white">
                Category
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-800 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {galleryItems.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No gallery items found.
                </td>
              </tr>
            ) : (
              galleryItems.map((item, index) => (
                <tr
                  key={item._id}
                  className={`border-t dark:border-gray-700 transition duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  <td className="px-6 py-4">
                    <img
                      src={item.image}
                      alt={item.category}
                      className="w-20 h-20 object-cover rounded-md border dark:border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-800 dark:text-white">{item.category}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setDeleteId(item._id)}
                      className="text-red-600 hover:underline font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-sm w-full border dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Confirm Deletion</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-sm w-full text-center border dark:border-gray-700">
            <h2 className="text-xl font-semibold text-green-600 mb-2">Upload Successful!</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Your image has been added to the gallery.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
