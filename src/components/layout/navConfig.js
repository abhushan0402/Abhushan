import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import StarOutlineOutlinedIcon from "@mui/icons-material/StarOutlineOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

export const navSections = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", path: "/", icon: DashboardOutlinedIcon, permission: "dashboard:view" }],
  },
  {
    title: "Catalogue",
    items: [
      { label: "Products", path: "/products", icon: DiamondOutlinedIcon, permission: "products:view" },
      { label: "Categories", path: "/categories", icon: CategoryOutlinedIcon, permission: "categories:manage" },
      { label: "Subcategories", path: "/subcategories", icon: CategoryOutlinedIcon, permission: "categories:manage" },
      { label: "Inventory", path: "/inventory", icon: Inventory2OutlinedIcon, permission: "inventory:manage" },
    ],
  },
  {
    title: "Commerce",
    items: [
      { label: "Orders", path: "/orders", icon: ShoppingBagOutlinedIcon, permission: "orders:view" },
      { label: "Customers", path: "/customers", icon: PeopleAltOutlinedIcon, permission: "customers:view" },
      { label: "Billing", path: "/billing", icon: ReceiptLongOutlinedIcon, permission: "billing:view" },
    ],
  },
  {
    title: "Engagement",
    items: [
      { label: "Offers", path: "/offers", icon: LocalOfferOutlinedIcon, permission: "offers:manage" },
      { label: "Reviews", path: "/reviews", icon: StarOutlineOutlinedIcon, permission: "products:view" },
      { label: "Notifications", path: "/notifications", icon: NotificationsNoneOutlinedIcon, permission: "notifications:manage" },
    ],
  },
  {
    title: "Administration",
    items: [{ label: "Users & Roles", path: "/users", icon: AdminPanelSettingsOutlinedIcon, permission: "users:manage" }],
  },
];

export const SIDEBAR_WIDTH = 264;
