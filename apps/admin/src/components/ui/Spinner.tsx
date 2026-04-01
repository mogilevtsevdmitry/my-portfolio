export function Spinner() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
