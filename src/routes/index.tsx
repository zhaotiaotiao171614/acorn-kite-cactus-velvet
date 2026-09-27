import { createFileRoute } from "@tanstack/react-router";
import { LiveProgress } from "@/components/chat-console";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <LiveProgress />;
}
