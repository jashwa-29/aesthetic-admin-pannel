import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import Layout from "@/routes/layout";
import GalleryPage from "./routes/Pages/GalleryPage";
import SpecialsPromotionPage from "./routes/Pages/SpecialsPromotionPage";
import LoginPage from "./routes/Pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import BlogPage from "./routes/Pages/BlogPage";
import BlogDetails from './routes/Pages/BlogDetails';

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <LoginPage />, // default root is login
        },
     
      {
  element: <ProtectedRoute />,
  children: [
    {
      path: "/dashboard",
      element: <Layout />,
      children: [
        { index: true, element: <GalleryPage /> },
        { path: "gallery", element: <GalleryPage /> },
        { path: "specials-promotion", element: <SpecialsPromotionPage /> },
        { path: "blogs", element: <BlogPage /> },
        { path: "blogs/:slug", element: <BlogDetails /> },  // nested under dashboard layout
      ],
    },
  ],
}

    ]);

    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;
