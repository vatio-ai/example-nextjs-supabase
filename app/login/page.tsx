import { LoginForm } from "./login-form";

// Also the page to name as `sign_in_url` for WhatsApp and Instagram: the
// widget in the root layout finishes that sign-in once the person is signed in.
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <>
      <h1>Sign in</h1>
      <p className="muted">We email you a link. No password.</p>
      {error && <p className="error">That link did not work. Ask for a new one.</p>}
      <LoginForm />
    </>
  );
}
