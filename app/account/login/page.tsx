import { AuthForm } from './auth-form';
import { Canvas } from './canvas';

export default function LoginPage() {
  return (
    <div className="grid grid-cols-[1fr] md:grid-cols-[2.5fr_4fr] max-h-full">
      <main className="flex flex-col items-center flex-1 flex-shrink-0 px-5 pt-16 pb-8 md:border-r shadow-lg border-grey-200/50">
        <AuthForm />
      </main>
      <div>
        <Canvas />
      </div>
    </div>
  );
}
