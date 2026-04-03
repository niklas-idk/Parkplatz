import AuthForm from "@/components/AuthForm";

export default function AnmeldenPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <AuthForm mode="login" />
    </div>
  );
}
