import { AppHeader } from '@/components/app-header';
import { PostGenerator } from '@/components/post-generator';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-10">
        <PostGenerator />
      </main>
    </div>
  );
}
