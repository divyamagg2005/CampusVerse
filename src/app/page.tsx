import FloatingActionButton from "@/components/FloatingActionButton";
import Feed from "@/components/Feed";

export default function Home() {
  return (
    <main className="flex flex-col items-center gap-8 p-4">
      <Feed />
      <FloatingActionButton />
    </main>
  );
}