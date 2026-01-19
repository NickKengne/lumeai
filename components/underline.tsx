export function Underline({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M2 7C25 4 50 3 75 4C100 5 125 6 150 5C170 4 190 3 198 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

