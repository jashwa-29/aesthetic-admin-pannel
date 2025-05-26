import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { TrashIcon, PencilIcon, PlusIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Helper functions to create fresh objects
const getEmptySection = () => ({ heading: "", content: "" });
const getEmptyFAQ = () => ({ question: "", answer: "" });
const getEmptyHighlightBox = () => ({ title: "", intro: "", points: [""] });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "link",
  "image",
];

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({
    title: "",
    slug: "",
    content: "",
    sections: [getEmptySection()],
    highlightBox: getEmptyHighlightBox(),
    faqs: [getEmptyFAQ()],
    category: "",
    tags: [],
    newTag: "",
    metaDescription: "",
    publishedDate: "",
    featuredImage: null,
    featuredImagePreview: null,
    author: "",
    isPublished: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
   const apiUri = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${apiUri}/api/blogs/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(res.data.blogs);
    } catch (err) {
      console.error("Failed to fetch blogs", err);
      setError("Failed to load blogs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "title") {
      setNewBlog((prev) => ({
        ...prev,
        title: value,
        slug: generateSlug(value),
      }));
    } else if (type === "checkbox") {
      setNewBlog((prev) => ({ ...prev, [name]: checked }));
    } else {
      setNewBlog((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (value) => {
    setNewBlog((prev) => ({ ...prev, content: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBlog((prev) => ({
          ...prev,
          featuredImage: file,
          featuredImagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Section handlers
  const handleSectionChange = (index, field, value) => {
    setNewBlog((prev) => {
      const updatedSections = prev.sections.map((section, i) => {
        if (i === index) {
          return { ...section, [field]: value };
        }
        return section;
      });
      return { ...prev, sections: updatedSections };
    });
  };

  const addSection = () => {
    setNewBlog((prev) => ({ ...prev, sections: [...prev.sections, getEmptySection()] }));
  };

  const removeSection = (index) => {
    const updatedSections = newBlog.sections.filter((_, i) => i !== index);
    setNewBlog((prev) => ({ 
      ...prev, 
      sections: updatedSections.length ? updatedSections : [getEmptySection()] 
    }));
  };

  // FAQ handlers
  const handleFAQChange = (index, field, value) => {
    setNewBlog((prev) => {
      const updatedFAQs = prev.faqs.map((faq, i) => {
        if (i === index) {
          return { ...faq, [field]: value };
        }
        return faq;
      });
      return { ...prev, faqs: updatedFAQs };
    });
  };

  const addFAQ = () => {
    setNewBlog((prev) => ({ ...prev, faqs: [...prev.faqs, getEmptyFAQ()] }));
  };

  const removeFAQ = (index) => {
    const updatedFAQs = newBlog.faqs.filter((_, i) => i !== index);
    setNewBlog((prev) => ({ 
      ...prev, 
      faqs: updatedFAQs.length ? updatedFAQs : [getEmptyFAQ()] 
    }));
  };

  // Highlight box handlers
  const handleHighlightBoxChange = (field, value) => {
    setNewBlog((prev) => ({
      ...prev,
      highlightBox: { ...prev.highlightBox, [field]: value },
    }));
  };

  const handleHighlightPointChange = (index, value) => {
    setNewBlog((prev) => {
      const updatedPoints = [...prev.highlightBox.points];
      updatedPoints[index] = value;
      return {
        ...prev,
        highlightBox: {
          ...prev.highlightBox,
          points: updatedPoints,
        },
      };
    });
  };

  const addHighlightPoint = () => {
    setNewBlog((prev) => ({
      ...prev,
      highlightBox: {
        ...prev.highlightBox,
        points: [...prev.highlightBox.points, ""],
      },
    }));
  };

  const removeHighlightPoint = (index) => {
    setNewBlog((prev) => {
      const updatedPoints = prev.highlightBox.points.filter((_, i) => i !== index);
      return {
        ...prev,
        highlightBox: {
          ...prev.highlightBox,
          points: updatedPoints.length ? updatedPoints : [""],
        },
      };
    });
  };

  // Tag handlers
  const addTag = () => {
    if (newBlog.newTag.trim() && !newBlog.tags.includes(newBlog.newTag.trim())) {
      setNewBlog((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: "",
      }));
    }
  };

  const removeTag = (index) => {
    setNewBlog((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const clearForm = () => {
    setNewBlog({
      title: "",
      slug: "",
      content: "",
      sections: [getEmptySection()],
      highlightBox: getEmptyHighlightBox(),
      faqs: [getEmptyFAQ()],
      category: "",
      tags: [],
      newTag: "",
      metaDescription: "",
      publishedDate: "",
      featuredImage: null,
      featuredImagePreview: null,
      author: "",
      isPublished: false,
    });
    setEditingId(null);
    setError("");
    // Reset file input
    const fileInput = document.getElementById('featuredImage');
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    if (!newBlog.title.trim()) return "Title is required";
    if (!newBlog.slug.trim()) return "Slug is required";
    if (!newBlog.author.trim()) return "Author is required";
    if (!editingId && !newBlog.featuredImage) return "Featured image is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();

      // Append simple fields
      formData.append("title", newBlog.title);
      formData.append("slug", newBlog.slug);
      formData.append("content", newBlog.content);
      formData.append("category", newBlog.category);
      formData.append("metaDescription", newBlog.metaDescription);
      formData.append("author", newBlog.author);
      formData.append("isPublished", newBlog.isPublished);
      if (newBlog.publishedDate) {
        formData.append("publishedDate", new Date(newBlog.publishedDate).toISOString());
      }

      // Append arrays and objects as JSON
      newBlog.tags.forEach(tag => formData.append("tags", tag));
      formData.append("sections", JSON.stringify(newBlog.sections));
      formData.append("faqs", JSON.stringify(newBlog.faqs));
      formData.append("highlightBox", JSON.stringify(newBlog.highlightBox));

      // Append image if present
      if (newBlog.featuredImage) {
        formData.append("featuredImage", newBlog.featuredImage);
      }

      let res;
      if (editingId) {
        res = await axios.put(`${apiUri}/api/blogs/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        res = await axios.post(`${apiUri}/api/blogs/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setSuccessMessage(editingId ? "Blog updated successfully!" : "Blog created successfully!");
      fetchBlogs();
      clearForm();
    } catch (err) {
      console.error("Error saving blog:", err);
      setError(err.response?.data?.message || "Failed to save blog. Please try again.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleEdit = (blog) => {
    setNewBlog({
      title: blog.title || "",
      slug: blog.slug || "",
      content: blog.content || "",
      sections: blog.sections?.length ? blog.sections.map(s => ({ 
        heading: s.heading || "", 
        content: s.content || "" 
      })) : [getEmptySection()],
      highlightBox: blog.highlightBox || getEmptyHighlightBox(),
      faqs: blog.faqs?.length ? blog.faqs.map(f => ({
        question: f.question || "",
        answer: f.answer || ""
      })) : [getEmptyFAQ()],
      category: blog.category || "",
      tags: blog.tags || [],
      newTag: "",
      metaDescription: blog.metaDescription || "",
      publishedDate: blog.publishedDate ? new Date(blog.publishedDate).toISOString().split("T")[0] : "",
      featuredImage: null,
      featuredImagePreview: blog.featuredImage || null,
      author: blog.author || "",
      isPublished: blog.isPublished || false,
    });
    setEditingId(blog._id);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = (id) => {
    setBlogToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${apiUri}/api/blogs/${blogToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBlogs();
      if (editingId === blogToDelete) clearForm();
    } catch (err) {
      console.error("Failed to delete blog", err);
      setError("Failed to delete blog. Please try again.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center">
            <CheckIcon className="h-5 w-5 mr-2" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this blog? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          {editingId ? "Edit Blog Post" : "Create New Blog Post"}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-100">
            {error}
          </div>
        )}

        <form 
          key={`form-${editingId || 'new'}`}
          onSubmit={handleSubmit} 
          className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          {/* Title and Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200" htmlFor="title">
                Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newBlog.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-500"
                placeholder="Enter blog title"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200" htmlFor="slug">
                Slug <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={newBlog.slug}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-500"
                placeholder="Auto-generated from title"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">
              Content
            </label>
            <ReactQuill
              value={newBlog.content}
              onChange={handleContentChange}
              modules={modules}
              formats={formats}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded"
              theme="snow"
            />
          </div>

          {/* Sections */}
          <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sections</h2>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Section
              </button>
            </div>

            {newBlog.sections.map((section, i) => (
              <div key={i} className="mb-4 border border-gray-200 rounded p-4 dark:border-gray-600 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Section {i + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeSection(i)}
                    disabled={newBlog.sections.length === 1}
                    className={`flex items-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors ${
                      newBlog.sections.length === 1 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Heading"
                  value={section.heading}
                  onChange={(e) => handleSectionChange(i, "heading", e.target.value)}
                  className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <ReactQuill
                  value={section.content}
                  onChange={(value) => handleSectionChange(i, "content", value)}
                  modules={modules}
                  formats={formats}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded"
                  theme="snow"
                />
              </div>
            ))}
          </div>

          {/* Highlight Box */}
          <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Highlight Box</h2>
            
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">Title</label>
              <input
                type="text"
                placeholder="Highlight box title"
                value={newBlog.highlightBox.title}
                onChange={(e) => handleHighlightBoxChange("title", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">Introduction</label>
              <textarea
                placeholder="Brief introduction"
                value={newBlog.highlightBox.intro}
                onChange={(e) => handleHighlightBoxChange("intro", e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-medium text-gray-800 dark:text-gray-200">Key Points</label>
                <button
                  type="button"
                  onClick={addHighlightPoint}
                  className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Add Point
                </button>
              </div>

              {newBlog.highlightBox.points.map((point, i) => (
                <div key={i} className="flex items-center mb-2">
                  <span className="mr-2 text-gray-600 dark:text-gray-400">{i + 1}.</span>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleHighlightPointChange(i, e.target.value)}
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeHighlightPoint(i)}
                    disabled={newBlog.highlightBox.points.length === 1}
                    className={`ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors ${
                      newBlog.highlightBox.points.length === 1 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">FAQs</h2>
              <button
                type="button"
                onClick={addFAQ}
                className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add FAQ
              </button>
            </div>

            {newBlog.faqs.map((faq, i) => (
              <div key={i} className="mb-4 border border-gray-200 rounded p-4 dark:border-gray-600 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">FAQ {i + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeFAQ(i)}
                    disabled={newBlog.faqs.length === 1}
                    className={`flex items-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors ${
                      newBlog.faqs.length === 1 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Remove
                  </button>
                </div>
                <div className="mb-3">
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Question</label>
                  <input
                    type="text"
                    placeholder="FAQ question"
                    value={faq.question}
                    onChange={(e) => handleFAQChange(i, "question", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Answer</label>
                  <textarea
                    placeholder="FAQ answer"
                    value={faq.answer}
                    onChange={(e) => handleFAQChange(i, "answer", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200" htmlFor="category">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={newBlog.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="e.g. Technology"
              />
            </div>

            {/* Tags Input */}
            <div>
              <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newBlog.tags.map((tag, index) => (
                  <div key={index} className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newBlog.newTag}
                  onChange={(e) => setNewBlog(prev => ({ ...prev, newTag: e.target.value }))}
                  onKeyDown={handleTagKeyDown}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-md"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200" htmlFor="metaDescription">
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={newBlog.metaDescription}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Brief description for SEO (150-160 characters)"
            />
          </div>

          {/* Publishing Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200" htmlFor="publishedDate">
                Published Date
              </label>
              <input
                type="date"
                id="publishedDate"
                name="publishedDate"
                value={newBlog.publishedDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200" htmlFor="featuredImage">
                Featured Image {editingId ? "(upload to replace)" : <span className="text-red-600">*</span>}
              </label>
              <input
                type="file"
                id="featuredImage"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
                  dark:file:bg-blue-900 dark:file:text-blue-100 dark:hover:file:bg-blue-800
                  transition-colors"
              />
              {newBlog.featuredImagePreview && (
                <div className="mt-2">
                  <img
                    src={newBlog.featuredImagePreview}
                    alt="Featured preview"
                    className="max-h-48 rounded border border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200" htmlFor="author">
                Author <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={newBlog.author}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Author name"
              />
            </div>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={newBlog.isPublished}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="isPublished" className="font-medium text-gray-800 dark:text-gray-200">
              Publish this post
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-70 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingId ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {editingId ? (
                    <>
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Update Blog
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Blog
                    </>
                  )}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={clearForm}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white disabled:opacity-70 transition-colors"
            >
              Clear Form
            </button>
          </div>
        </form>

        {/* Blog List */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Your Blog Posts</h2>
            <button
              onClick={() => {
                clearForm();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Blog
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-400">No blog posts found. Create your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {blogs.map((blog) => (
  <div
    key={blog._id}
    className="border border-gray-200 rounded-lg p-4 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
  >
    {blog.featuredImage && (
      <Link to={`/dashboard/blogs/${blog.slug}`}>
        <img
          src={blog.featuredImage}
          alt={blog.title}
          className="w-full h-40 object-cover rounded mb-3"
        />
      </Link>
    )}
    <Link to={`/dashboard/blogs/${blog.slug}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 hover:underline">
        {blog.title}
      </h3>
    </Link>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
      {blog.category && (
        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded mr-2">
          {blog.category}
        </span>
      )}
      {blog.isPublished ? (
        <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
          Published
        </span>
      ) : (
        <span className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded">
          Draft
        </span>
      )}
    </p>
    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
      {blog.metaDescription}
    </p>
    <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {new Date(blog.publishedDate || blog.createdAt).toLocaleDateString()}
      </span>
      <div className="flex space-x-2">
        <button
          onClick={() => handleEdit(blog)}
          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          title="Edit"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => confirmDelete(blog._id)}
          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          title="Delete"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
))}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;     