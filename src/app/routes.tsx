import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Team } from "./pages/Team";
import { Projects } from "./pages/Projects";
import { Plans } from "./pages/Plans";
import { Contact } from "./pages/Contact";
import { Admin } from "./pages/Admin";
import { NotFound } from "./pages/NotFound";
import { RouteError } from "./pages/RouteError";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ServerChat } from "./pages/ServerChat";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    errorElement: <RouteError />,
    children: [
      { index: true, Component: Home },
      { path: "team", Component: Team },
      { path: "projects", Component: Projects },
      { path: "plans", Component: Plans },
      { path: "contact", Component: Contact },
      { path: "admin", Component: Admin },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "server", Component: ServerChat },
      { path: "*", Component: NotFound },
    ],
  },
]);
