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
import ClientTodxsWeb from "../Pages/ClientTodxsWeb/ClientTodxsWeb";
import ClientBrandtop from "../Pages/ClientBrandtop/ClientBrandtop";
import ClientLightsEnglishAdacemy from "../Pages/ClientLightsEnglishAcademy/ClientLightsEnglishAcademy";
import IllustrationDesign from "../Pages/IllustrationDesign/IllustrationDesign"; 
import BusinessBranding from "../Pages/BusinessBranding/BusinessBranding";
import WebDesign from "../Pages/WebDesign/WebDesign";
import PaidMedia from "../Pages/PaidMedia/PaidMedia";
import VideoEditing from "../Pages/VideoEditing/VideoEditing";
// ✨ NUEVA IMPORTACIÓN: Componente para la pasarela de pagos
import Checkout from "../Pages/Checkout/Checkout";
import PaymentSuccess from "../Components/Success/PaymentSuccess";
import AdminBlog from "../Pages/AdminBlog/AdminBlog";

export const router = createBrowserRouter([
  // Fuera de Root a propósito: es una herramienta interna, no debe llevar
  // el header/nav/footer del sitio público ni aparecer enlazada en ningún
  // menú. No es autenticación real — solo ofuscación por URL + la frase
  // secreta que exige la función (BLOG_ADMIN_SECRET).
  {
    path: "/admin-blog",
    element: <AdminBlog />,
  },
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
        // Rutas de detalle de servicio
        path: "/services/illustration-design",
        element: <IllustrationDesign />,
      },
      {
        path: "/services/business-branding",
        element: <BusinessBranding />,
      },
      {
        path: "/services/web-design",
        element: <WebDesign />,
      },
      {
        path: "/services/paid-media",
        element: <PaidMedia />,
      },
      {
        path: "/services/video-editing",
        element: <VideoEditing />,
      },
      // ✨ NUEVA RUTA: Para el proceso de pago
      {
        path: "/checkout",
        element: <Checkout />,
      },
      {
        path: "/success",
        element: <PaymentSuccess />,
      },
      {
        path: "/all-blog",
        element: <AllBlogs />,
      },
      {
        path: "/blog/:slug",
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
        path: "/client-todxspodemosser-web",
        element: <ClientTodxsWeb/>,
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
