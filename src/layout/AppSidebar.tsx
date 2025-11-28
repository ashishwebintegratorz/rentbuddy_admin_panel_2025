import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  UserCircleIcon,
  PaymentIcon,
  OrderIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  sumItems?: NavItem[];
};

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <GridIcon />,
    path: "/",
  },

  {
    name: "Customer Management",
    icon: <UserCircleIcon />,
    subItems: [
      { name: "Customers", path: "/customers" },
      { name: "Complaints", path: "/complaints" },
      { name: "Defaulters", path: "/defaulters" },
      { name: "Rent History", path: "/rent-history" },
    ],
  },

  {
    name: "Order Management",

    icon: <OrderIcon />,
    subItems: [
      { name: "Orders", path: "/orders" },
      { name: "Subscriptions", path: "/subscriptions" },
      { name: "Recurring Payments", path: "/recurring-payments" },
      { name: "Refund", path: "/refund" },
      { name: "Return", path: "/return" },
      { name: "Repair", path: "/repair" },
    ],
  },

  {
    name: "Products & Inventory",
    icon: <BoxCubeIcon />,
    subItems: [
      { name: "Products", path: "/products" },
      { name: "Packages", path: "/packages" },
      { name: "Barcode", path: "/barcode" },
      { name: "Track", path: "/track" },
    ],
  },

  {
    name: "Billing & Finance",
    icon: <PaymentIcon />,
    subItems: [
      { name: "Payments", path: "/payments" },
      { name: "Invoice", path: "/invoice" },
      { name: "Documents", path: "/documents" },
    ],
  },
];

const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        // @ts-ignore optional subItems
        if (nav.subItems) {
          // @ts-ignore
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) setOpenSubmenu(null);
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpen) => {
      if (prevOpen && prevOpen.type === menuType && prevOpen.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-3">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {/* if you add subItems later this is ready */}
          {/* @ts-ignore */}
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {/* sub menu future-proof */}
          {/* @ts-ignore */}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 ml-9 space-y-1">
                {/* @ts-ignore */}
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col
        px-5
        border-r border-slate-300
        bg-gradient-to-b from-white/80 via-white/70 to-white/40
        text-slate-900]
        dark:border-white/10
        dark:from-slate-950/90 dark:via-slate-950/80 dark:to-slate-900/70
        dark:text-slate-100
        transition-all duration-300 ease-in-out
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:mt-0 lg:translate-x-0
      `}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* subtle side glow to match cards */}
      {/* <div className="pointer-events-none absolute inset-y-0 right-0 w-px border-r bg-gradient-to-b from-slate-500/25 via-slate-500/10 dark:bg-gradient-to-b dark:from-blue-500/25 dark:via-purple-500/10 to-transparent" /> */}

      <div
        className={`flex py-8 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <h1 className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-2xl font-bold tracking-[0.18em] text-transparent dark:from-slate-50 dark:via-slate-100 dark:to-slate-200">
              RENTBUDDY
            </h1>
          ) : (
            <h1 className="text-center text-2xl font-bold tracking-[0.18em] text-slate-900 dark:text-slate-50">
              RB
            </h1>
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto pb-6 pr-1">
        <nav className="mb-6">
          <div className="flex flex-col gap-5">
            <div>
              <h2
                className={`mb-3 flex text-xs uppercase leading-[20px] tracking-[0.18em] text-slate-400 dark:text-slate-500 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
