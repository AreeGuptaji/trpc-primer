import SignInPage from "@/app/_components/SignInPage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SignIn() {
  const session = await auth();
  if (session) {
    redirect("/");
  }

  return (
    <>
      <SignInPage />
    </>
  );
}
