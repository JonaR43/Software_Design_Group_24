import { redirect } from "react-router";
import type { Route } from "./+types/_index";

export function loader({ request }: Route.LoaderArgs) {
  return redirect("/login");
}

export default function Index() {
  return null;
}
