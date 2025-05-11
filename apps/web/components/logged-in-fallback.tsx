import Link from "next/link";

const LoggedInFallback = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Already Logged In</h1>
      <p>
        You are already logged in. Go to your{" "}
        <Link
          href="/dashboard"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Dashboard
        </Link>
        .
      </p>
    </div>
  );
};

export default LoggedInFallback;
