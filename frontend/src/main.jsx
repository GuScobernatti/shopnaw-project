import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GlobalStyle } from "./globalStyle/GlobalStyle.jsx";
import ProductProvider from "./contexts/productContext/productContextProvider.jsx";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/home/Home.jsx";
import Site from "./pages/site/Site.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Login from "./pages/login/Login.jsx";
import SignUp from "./pages/signUp/SignUp.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import ProductPage from "./pages/eachProductPage/ProductPage.jsx";
import HomeDashboard from "./components/DashboardSection/Home/HomeDashboard.jsx";
import Form from "./components/DashboardSection/GProducts/form/Form.jsx";
import AddedShirts from "./components/DashboardSection/GProducts/addedShirts/AddedShirts.jsx";
import Orders from "./components/DashboardSection/Orders/Orders.jsx";
import RegisteredClients from "./components/DashboardSection/Clients/RegisteredClients/RegisteredClients.jsx";
import UpdateInfo from "./components/DashboardSection/Settings/UpdateShopInfo/UpdateInfo.jsx";
import ManageCategories from "./components/DashboardSection/Settings/ManageCategories/ManageCategories.jsx";
import PromotionsManager from "./components/DashboardSection/Settings/OffersAndCupons/PromotionsManager.jsx";
import PromotionsProvider from "./contexts/promotionsContext/promotionsContextProvider.jsx";
import AuthProvider from "./contexts/loginContext/authContextProvider.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import Success from "./pages/Checkout/Success.jsx";
import PrivateRoutes from "./routes/PrivateRoutes.jsx";
import ConfigProvider from "./contexts/configContext/configContextProvider.jsx";
import AdminRoutes from "./routes/AdminRoutes.jsx";
import ForgotPassword from "./pages/Account/ForgotPassword";
import ResetPassword from "./pages/Account/ResetPassword";
import TermsOfUse from "./pages/Institutional/TermsOfUse.jsx";
import PrivacyPolicy from "./pages/Institutional/PrivacyPolicy.jsx";
import MyOrders from "./pages/Account/MyOrders.jsx";
import NotFound from "./pages/NotFound/NotFound";
import VerifyEmail from "./pages/Account/VerifyEmail.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CookieConsent from "react-cookie-consent";

const router = createBrowserRouter([
  {
    path: "/site",
    element: <App />,
    children: [
      {
        path: "/site",
        element: <Site />,
      },
      {
        path: "/site/product/:name/:id",
        element: <ProductPage />,
      },
    ],
  },
  {
    path: "/checkout/carrinho",
    element: <Cart />,
  },
  // --- ROTAS PROTEGIDAS ---
  {
    element: <PrivateRoutes />,
    children: [
      {
        path: "/checkout",
        element: <Checkout />,
      },
      {
        path: "/checkout/success",
        element: <Success />,
      },
      {
        path: "/account/orders",
        element: <MyOrders />,
      },
    ],
  },
  // ----------------
  {
    path: "/account/login",
    element: <Login />,
  },
  {
    path: "/account/cadastro",
    element: <SignUp />,
  },
  {
    path: "/account/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/account/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/account/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/termos-de-uso",
    element: <TermsOfUse />,
  },
  {
    path: "/politica-de-privacidade",
    element: <PrivacyPolicy />,
  },
  // --- ROTAS PROTEGIDAS ---
  {
    element: <AdminRoutes />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
        children: [
          {
            index: true,
            element: <HomeDashboard />,
          },
          {
            path: "/dashboard/products/addProduct",
            element: <Form />,
          },
          {
            path: "/dashboard/products/addedProducts",
            element: <AddedShirts />,
          },
          {
            path: "/dashboard/orders",
            element: <Orders />,
          },
          {
            path: "/dashboard/clients/registeredClients",
            element: <RegisteredClients />,
          },
          {
            path: "/dashboard/settings/updateShopInfo",
            element: <UpdateInfo />,
          },
          {
            path: "/dashboard/settings/manageCategories",
            element: <ManageCategories />,
          },
          {
            path: "/dashboard/settings/offers",
            element: <PromotionsManager />,
          },
        ],
      },
    ],
  },

  // ----------------
  {
    path: "*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastContainer
      position="top-right"
      autoClose={2000}
      hideProgressBar
      newestOnTop={false}
      closeOnClick
      style={{ zIndex: 999999 }}
    />

    <ConfigProvider>
      <AuthProvider>
        <PromotionsProvider>
          <ProductProvider>
            <GlobalStyle />
            <RouterProvider router={router} />
            <CookieConsent
              location="bottom"
              buttonText="Aceitar e Fechar"
              cookieName="shopnaw_cookie_consent"
              style={{ background: "#82858b", fontSize: "14px" }}
              buttonStyle={{
                background: "#fff",
                color: "#82858b",
                fontSize: "13px",
                borderRadius: "5px",
                padding: "10px 20px",
              }}
              expires={150}
            >
              Este site utiliza cookies para melhorar a experiência do usuário e
              gerenciar o funcionamento da loja.{" "}
              <a
                href="/politica-de-privacidade"
                style={{ color: "#fff", textDecoration: "underline" }}
              >
                Leia nossa política
              </a>
              .
            </CookieConsent>
          </ProductProvider>
        </PromotionsProvider>
      </AuthProvider>
    </ConfigProvider>
  </StrictMode>
);
