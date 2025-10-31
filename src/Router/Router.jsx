import { createBrowserRouter } from "react-router-dom";
import Root from "../Layouts/Root";
import Home from "../Pages/Home";
import AllServices from "../Pages/AllServices";
import ServiceDetails from "../Pages/ServiceDetails";
import Contact from "../Pages/Contact/Contact";
import AllBlogs from "../Pages/AllBlogs/AllBlogs";
import BlogDetails from "../Pages/BlogDetails/BlogDetails";
import Protfolio from "../Pages/Protfolio/Protfolio";
import ProtfolioDetails from "../Pages/ProtfolioDetails/ProtfolioDetails";
import ClientReyAntiguedades from "../Pages/ClientReyAntiguedades/ClientReyAntiguedades";
import ClientNfAutoparts from "../Pages/ClientNfAutoparts/ClientNfAutoparts";
import ClientTodxsPodemosSer from "../Pages/ClientTodxsPodemosSer/ClientTodxsPodemosSer";
import ClientBrandtop from "../Pages/ClientBrandtop/ClientBrandtop";
import ClientLightsEnglishAdacemy from "../Pages/ClientLightsEnglishAcademy/ClientLightsEnglishAcademy";
import IllustrationDesign from "../Pages/IllustrationDesign/IllustrationDesign"; 
import BusinessBranding from "../Pages/BusinessBranding/BusinessBranding";
import WebDesign from "../Pages/WebDesign/WebDesign";
import PaidMedia from "../Pages/PaidMedia/PaidMedia";
import VideoEditing from "../Pages/VideoEditing/VideoEditing";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/all-services",
        element: <AllServices />,
      },
      {
        // Ruta genérica original (la mantendremos)
        path: "/service-details",
        element: <ServiceDetails />,
      },
      {
        // ✨ CORREGIDO: URL pública debe ser /services/nombre
        path: "/services/illustration-design",
        element: <IllustrationDesign />,
      },
      {
        // ✨ CORREGIDO
        path: "/services/business-branding",
        element: <BusinessBranding />,
      },
      {
        // ✨ CORREGIDO
        path: "/services/web-design",
        element: <WebDesign />,
      },
      {
        // ✨ CORREGIDO
        path: "/services/paid-media",
        element: <PaidMedia />,
      },
      {
        // ✨ CORREGIDO
        path: "/services/video-editing",
        element: <VideoEditing />,
      },
      {
        path: "/all-blog",
        element: <AllBlogs />,
      },
      {
        path: "/blog-details",
        element: <BlogDetails />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/portfolio",
        element: <Protfolio />,
      },
      {
        path: "/client-javitoyz",
        element: <ProtfolioDetails />,
      },
      {
        path: "/client-reyantiguedades",
        element: <ClientReyAntiguedades />,
      },
      {
        path: "/client-nfautoparts",
        element: <ClientNfAutoparts/>,
      },
      {
        path: "/client-todxspodemosser",
        element: <ClientTodxsPodemosSer/>,
      },
      {
        path: "/client-brandtop",
        element: <ClientBrandtop/>,
      },
      {
        path: "/client-lightsenglishacademy",
        element: <ClientLightsEnglishAdacemy/>,
      },
    ],
  },
]);
