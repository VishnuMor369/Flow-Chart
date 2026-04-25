export default function ConcentricLoader() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 fixed inset-0 z-[100] bg-background">
      <div className="flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-transparent border-t-[#8bc34a] text-4xl">
        <div className="flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-transparent border-t-white text-2xl"></div>
      </div>
    </div>
  );
}
