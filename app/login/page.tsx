import { redirect } from "next/navigation";

// Accounts are temporarily disabled -- posting works as a guest from /upload.
// Revert this redirect (and re-link Log in/Sign up in components/navbar.tsx)
// to bring accounts back.
export default function LoginPage() {
  redirect("/");
}
