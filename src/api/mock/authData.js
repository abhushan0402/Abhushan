import { ROLE_PERMISSIONS } from "../../auth/rolePermissions";

export const MOCK_USERS = [
  {
    credential: { email: "lubomir@abhushanvatika.com", password: "password" },
    user: {
      id: "usr-0001",
      name: "Lubomir Dvorak",
      email: "lubomir@abhushanvatika.com",
      role: "superadmin",
      permissions: ROLE_PERMISSIONS.superadmin,
    },
  },
  {
    credential: { email: "admin@abhushanvatika.com", password: "password" },
    user: {
      id: "usr-0002",
      name: "Aarav Sharma",
      email: "admin@abhushanvatika.com",
      role: "admin",
      permissions: ROLE_PERMISSIONS.admin,
    },
  },
  {
    credential: { email: "manager@abhushanvatika.com", password: "password" },
    user: {
      id: "usr-0003",
      name: "Priya Kapoor",
      email: "manager@abhushanvatika.com",
      role: "manager",
      permissions: ROLE_PERMISSIONS.manager,
    },
  },
  {
    credential: { email: "staff@abhushanvatika.com", password: "password" },
    user: {
      id: "usr-0004",
      name: "Neha Malhotra",
      email: "staff@abhushanvatika.com",
      role: "staff",
      permissions: ROLE_PERMISSIONS.staff,
    },
  },
];
