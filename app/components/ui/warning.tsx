export default function Warning() {
  return (
    <div className="w-full h-10 bg-red-600 flex absolute z-50">
      <p className="text-white text-base text-center m-auto">
        Experimental app: Files auto-delete after 24 hours. Proceed with caution and backup accordingly.
      </p>
    </div>
  );
}
