// lucide-react dropped brand icons in v1, so the GitHub mark is inlined here
const GithubIcon = ({ size = 20, className }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 .5C5.73.5.67 5.56.67 11.83c0 5 3.24 9.24 7.74 10.74.57.1.78-.25.78-.55v-1.93c-3.15.69-3.81-1.52-3.81-1.52-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.52-2.51-.29-5.16-1.26-5.16-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.44.11-3 0 0 .95-.31 3.12 1.16a10.8 10.8 0 0 1 5.68 0c2.17-1.47 3.12-1.16 3.12-1.16.62 1.56.23 2.71.11 3 .73.79 1.17 1.8 1.17 3.04 0 4.35-2.65 5.31-5.17 5.59.41.35.77 1.04.77 2.1v3.11c0 .3.21.66.79.55a11.34 11.34 0 0 0 7.73-10.74C23.33 5.56 18.27.5 12 .5Z" />
  </svg>
);

export default GithubIcon;
