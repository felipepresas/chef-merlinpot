const SIZES = {
  sm: "h-7 w-7 text-xs",
  md: "h-10 w-10 text-sm",
} as const;

/** Avatar circular con la inicial del nombre (o del email). */
export function Avatar({
  name,
  email,
  size = "md",
}: {
  name?: string | null;
  email: string;
  size?: keyof typeof SIZES;
}) {
  const initial = (name?.trim()?.[0] ?? email[0] ?? "?").toUpperCase();
  return (
    <span
      className={`flex ${SIZES[size]} shrink-0 items-center justify-center rounded-full bg-brand/10 font-semibold text-brand`}
    >
      {initial}
    </span>
  );
}
