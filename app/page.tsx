import Link from 'next/link';

export default function Home() {
  return (
    <>
      <div className="absolute top-0 left-0 bg-repeat w-full h-full -z-10 bg-[url('/dot.png')]" aria-hidden></div>
      <section className="m-auto px-4 space-y-6 py-10">
        <h1 className="max-w-[15ch] text-5xl md:text-7xl">Unleash Your Writing Creativity</h1>
        <p className="max-w-[40ch] text-xl md:text-2xl font-normal">
          Customizable writing tool enhances productivity for students, professionals, and writers.
        </p>
        <Link
          href="/dashboard"
          className="inline-block text-lg font-medium leading-none text-inherit py-5 px-10 rounded-full outline-none ring-2 dark:ring-grey-200 ring-grey-900 hover:ring-4 focus-visible:ring-4 transition-all capitalize"
        >
          start write
        </Link>
      </section>
    </>
  );
}
