export default function ButtonSpinner({size = 32, color = "#f33d74"}) {
    return (
        <svg
            className="animate-spin"
            width={size}
            height={size}
            viewBox="0 0 50 50"
            style={{display: "inline-block", verticalAlign: "middle"}}
        >
            <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke={color}
                strokeWidth="5"
                strokeDasharray="90"
                strokeDashoffset="30"
                strokeLinecap="round"
                opacity="0.7"
            />
        </svg>
    );
}