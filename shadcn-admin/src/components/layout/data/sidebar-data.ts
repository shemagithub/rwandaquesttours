import {
  BarChart3,
  Bell,
  Calendar,
  CalendarDays,
  Car,
  CreditCard,
  Image,
  LayoutDashboard,
  MessageSquare,
  Mountain,
  MapPinned,
  Navigation,
  Newspaper,
  Package,
  Settings,
  Shield,
  Star,
  UserCircle,
  Users,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'superadmin@tourism.local',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Tourism Admin',
      logo: Mountain,
      plan: 'Operations',
    },
  ],
  navGroups: [
    {
      title: 'Main',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          title: 'Users',
          icon: Users,
          items: [
            { title: 'All Users', url: '/users' },
            { title: 'Customers', url: '/users/customers' },
            { title: 'Staff / Admins', url: '/users/staff' },
            { title: 'Tour Guides', url: '/users/tour-guides' },
          ],
        },
        {
          title: 'Tour Packages',
          icon: Package,
          items: [
            { title: 'All Packages', url: '/tour-packages' },
            { title: 'Add Package', url: '/tour-packages/new' },
            { title: 'Package Categories', url: '/tour-packages/categories' },
            { title: 'Itineraries', url: '/tour-packages/itineraries' },
          ],
        },
        {
          title: 'Destinations',
          icon: MapPinned,
          items: [
            { title: 'All Destinations', url: '/destinations' },
            { title: 'Add Destination', url: '/destinations/new' },
          ],
        },
        {
          title: 'Bookings',
          icon: CalendarDays,
          items: [
            { title: 'All Bookings', url: '/bookings' },
            { title: 'Pending', url: '/bookings/pending' },
            { title: 'Confirmed', url: '/bookings/confirmed' },
            { title: 'Cancelled', url: '/bookings/cancelled' },
          ],
        },
        {
          title: 'Car rental',
          icon: Car,
          items: [
            { title: 'Quote requests', url: '/car-rental' },
            { title: 'Pending quotes', url: '/car-rental/pending' },
            { title: 'Fleet vehicles', url: '/car-rental/vehicles' },
            { title: 'Add vehicle', url: '/car-rental/vehicles/new' },
          ],
        },
        {
          title: 'Payments',
          icon: CreditCard,
          items: [
            { title: 'Transactions', url: '/payments/transactions' },
            { title: 'Payment Status', url: '/payments/status' },
            { title: 'Refunds', url: '/payments/refunds' },
          ],
        },
      ],
    },
    {
      title: 'Content',
      items: [
        {
          title: 'Blog',
          icon: Newspaper,
          items: [
            { title: 'All Posts', url: '/blog' },
            { title: 'Add Post', url: '/blog/new' },
            { title: 'Categories', url: '/blog/categories' },
          ],
        },
        {
          title: 'Gallery',
          icon: Image,
          items: [
            { title: 'All Media', url: '/gallery' },
            { title: 'Upload Images', url: '/gallery/upload' },
          ],
        },
        {
          title: 'Reviews',
          icon: Star,
          items: [
            { title: 'All Reviews', url: '/reviews' },
            { title: 'Pending Approval', url: '/reviews/pending' },
          ],
        },
        {
          title: 'Messages',
          icon: MessageSquare,
          items: [
            { title: 'Inquiries', url: '/messages/inquiries' },
            { title: 'Contact Messages', url: '/messages/contact' },
          ],
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          title: 'Tour Guides',
          icon: UserCircle,
          items: [
            { title: 'All Guides', url: '/guides' },
            { title: 'Assign Guides', url: '/guides/assign' },
            { title: 'Availability', url: '/guides/availability' },
          ],
        },
        {
          title: 'Calendar',
          url: '/calendar',
          icon: Calendar,
        },
        {
          title: 'Live Tracking',
          url: '/tracking',
          icon: Navigation,
        },
        {
          title: 'Notifications',
          url: '/notifications',
          icon: Bell,
        },
      ],
    },
    {
      title: 'Analytics',
      items: [
        {
          title: 'Reports',
          icon: BarChart3,
          items: [
            { title: 'Revenue Reports', url: '/reports/revenue' },
            { title: 'Booking Reports', url: '/reports/bookings' },
            { title: 'User Analytics', url: '/reports/analytics' },
          ],
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            { title: 'General Settings', url: '/settings' },
            { title: 'Website Content', url: '/settings/content' },
            { title: 'SEO Settings', url: '/settings/seo' },
            { title: 'Social Links', url: '/settings/social' },
          ],
        },
        {
          title: 'Security',
          icon: Shield,
          items: [
            { title: 'Roles & Permissions', url: '/security/roles' },
            { title: 'Activity Logs', url: '/security/activity' },
          ],
        },
      ],
    },
  ],
}
