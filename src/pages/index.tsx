import Link from "next/link";

export default function Home() {
  return <div className="flex items-center justify-center h-screen w-screen text-3xl">
    <Link href="/page1">Navigate to Page 1</Link>
  </div>
}
