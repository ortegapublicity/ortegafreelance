import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./Router/Router.jsx";

import AOS from "aos";
import "aos/dist/aos.css";
import Test from "./Test";

const App = () => {
  useEffect(() => {
    AOS.init();
  }, []);
  return (
    <>
      <RouterProvider router={router} />
      <Test />
    </>
  );
};

export default App;


