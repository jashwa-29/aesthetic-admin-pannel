import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";

const BlogDetails = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`https://aesthetic-backend-5jyv.onrender.com/api/blogs/slug/${slug}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Assume API returns blog object in res.data.blog or similar — adjust as needed
        setBlog( res.data); 
      } catch (error) {
        console.error("Error fetching blog:", error);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug, token]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!blog) return <div className="p-6 text-center text-red-500">Blog not found.</div>;

  // Fix tags to ensure it's an array of strings
  let tags = [];
  if (blog.tags) {
    if (typeof blog.tags === "string") {
      try {
        tags = JSON.parse(blog.tags);
      } catch {
        tags = [];
      }
    } else if (Array.isArray(blog.tags)) {
      tags = blog.tags;
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Helmet>
        <title>{blog.title}</title>
        <meta name="description" content={blog.metaDescription || ""} />
      </Helmet>


     <Link to='/dashboard/blogs'>
         <button className="px-6 py-2 bg-blue-700 rounded-md text-white my-4">Back</button>
     </Link>

      {blog.featuredImage && (
        <img
          src={blog.featuredImage}
          alt={blog.title}
          className="w-full rounded-lg mb-6"
        />
      )}

      <h1 className="text-4xl font-bold mb-2">{blog.title}</h1>

      <p className="text-gray-500 dark:text-gray-400 mb-4">
        By {blog.author} •{" "}
        {new Date(blog.publishedDate || blog.createdAt).toLocaleDateString()}
      </p>

      {blog.content && (
        <div
          className="prose dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      )}

      {blog.highlightBox?.title && (
        <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 p-4 mb-8 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">{blog.highlightBox.title}</h3>
          <p className="mb-2" style={{ whiteSpace: "pre-line" }}>
            {blog.highlightBox.intro}
          </p>
          <ul className="list-disc list-inside">
            {blog.highlightBox.points?.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(blog.sections) &&
        blog.sections.map((section) => (
          <div key={section._id || section.heading} className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">{section.heading}</h2>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        ))}

      {tags.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold">Tags:</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-200 dark:bg-gray-700 text-sm px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(blog.faqs) && blog.faqs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">FAQs</h2>
          <div className="space-y-4">
            {blog.faqs.map((faq) => (
              <div key={faq._id || faq.question}>
                <h4 className="font-semibold">{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetails;
