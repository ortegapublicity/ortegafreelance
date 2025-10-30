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
        path: "/service-details",
        element: <ServiceDetails />,
      },
      {
        path: "/Pages/illustration-design",
        element: <IllustrationDesign />,
      },
      {
        path: "/Pages/business-branding",
        element: <BusinessBranding />,
      },
      {
        path: "/Pages/web-design",
        element: <WebDesign />,
      },
      {
        path: "/Pages/paid-media",
        element: <PaidMedia />,
      },
      {
        path: "/Pages/video-editing",
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
