import { lazy } from "react";
import { RouteObject } from "react-router-dom";

const HomePage = lazy(() => import("../pages/home/page"));
const ShopPage = lazy(() => import("../pages/shop/page"));
const CheckoutPage = lazy(() => import("../pages/checkout/page"));
const ContactPage = lazy(() => import("../pages/contact/page"));
const NotFound = lazy(() => import("../pages/NotFound"));
const AdminLayout = lazy(() => import("../pages/admin/layout"));
const AdminDashboard = lazy(() => import("../pages/admin/page"));
const StorePage = lazy(() => import("../pages/admin/settings/StorePage"));
const CurrencyPage = lazy(() => import("../pages/admin/settings/CurrencyPage"));
const NavbarPage = lazy(() => import("../pages/admin/settings/NavbarPage"));
const UserProfilePage = lazy(() => import("../pages/admin/settings/UserProfilePage"));
const RoleManagementPage = lazy(() => import("../pages/admin/settings/RoleManagementPage"));
const HeroPage = lazy(() => import("../pages/admin/content/HeroPage"));
const PromotionalPage = lazy(() => import("../pages/admin/content/PromotionalPage"));
const PopularPage = lazy(() => import("../pages/admin/content/PopularPage"));
const RecommendedPage = lazy(() => import("../pages/admin/content/RecommendedPage"));
const FeaturedPage = lazy(() => import("../pages/admin/content/FeaturedPage"));
const FooterPage = lazy(() => import("../pages/admin/content/FooterPage"));
const PriceHistoryPage = lazy(() => import("../pages/admin/content/PriceHistoryPage"));
const CategoriesPage = lazy(() => import("../pages/admin/content/CategoriesPage"));
const OrdersPage = lazy(() => import("../pages/admin/orders/OrdersPage"));
const PaymentsPage = lazy(() => import("../pages/admin/orders/PaymentsPage"));
const AdminCheckoutPage = lazy(() => import("../pages/admin/checkout/page"));
const ProductDetailPage = lazy(() => import("../pages/product/page"));
const NewArrivalsAdminPage = lazy(() => import("../pages/admin/content/NewArrivalsPage"));
const AnnouncementBarPage = lazy(() => import("../pages/admin/content/AnnouncementBarPage"));

const routes: RouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/shop",
    element: <ShopPage />,
  },
  {
    path: "/product/:id",
    element: <ProductDetailPage />,
  },
  {
    path: "/checkout",
    element: <CheckoutPage />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "settings/store",
        element: <StorePage />,
      },
      {
        path: "settings/currency",
        element: <CurrencyPage />,
      },
      {
        path: "settings/navbar",
        element: <NavbarPage />,
      },
      {
        path: "settings/user-profile",
        element: <UserProfilePage />,
      },
      {
        path: "settings/roles",
        element: <RoleManagementPage />,
      },
      {
        path: "content/hero",
        element: <HeroPage />,
      },
      {
        path: "content/promotional",
        element: <PromotionalPage />,
      },
      {
        path: "content/popular",
        element: <PopularPage />,
      },
      {
        path: "content/recommended",
        element: <RecommendedPage />,
      },
      {
        path: "content/featured",
        element: <FeaturedPage />,
      },
      {
        path: "content/footer",
        element: <FooterPage />,
      },
      {
        path: "content/categories",
        element: <CategoriesPage />,
      },
      {
        path: "content/price-history",
        element: <PriceHistoryPage />,
      },
      {
        path: "content/new-arrivals",
        element: <NewArrivalsAdminPage />,
      },
      {
        path: "content/announcement-bar",
        element: <AnnouncementBarPage />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "orders/payments",
        element: <PaymentsPage />,
      },
      {
        path: "checkout",
        element: <AdminCheckoutPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;