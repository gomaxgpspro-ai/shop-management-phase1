import {
  LayoutDashboard, Wallet, BookOpen, Package, ShoppingCart, Boxes, Users,
  ReceiptText, ClipboardList, Banknote, Truck, UserRound,
  CarFront, CalendarDays, ChartNoAxesCombined, Settings
} from "lucide-react";

export const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Employee Dashboard", path: "/employee-dashboard", icon: UserRound },
  { label: "Accounts", path: "/accounts", icon: Wallet },
  { label: "Due Payment Ledger", path: "/due-payment-ledger", icon: BookOpen },
  { label: "Product & Purchase", path: "/purchase", icon: ShoppingCart },
  { label: "Stock", path: "/stock", icon: Boxes },
  { label: "Sale", path: "/sale", icon: ReceiptText, children: [
    { label: "Installment Sale", path: "/sale/installment", icon: ReceiptText },
    { label: "Challan", path: "/challan", icon: ClipboardList }
  ] },
  { label: "Pre-Order", path: "/pre-order", icon: ClipboardList },
  { label: "Expense", path: "/expense", icon: Banknote },
  { label: "Customer", path: "/customer", icon: Users },
  { label: "Vendor", path: "/vendor", icon: Truck },
  { label: "Employee", path: "/employee", icon: UserRound },
  { label: "User Management", path: "/users", icon: Users },
  { label: "Vehicle", path: "/vehicle", icon: CarFront },
  { label: "Daily Rent Collection", path: "/daily-rent-collection", icon: CalendarDays },
  { label: "Reports", path: "/reports", icon: ChartNoAxesCombined },
  { label: "Setting", path: "/setting", icon: Settings }
];
