import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: "120px 4.8vw", textAlign: "center" }}>
      <h1>404</h1>
      <p className="lead">Bogga aad raadinayso lama helin.</p>
      <Link className="btn primary" to="/">Ku noqo bogga hore →</Link>
    </div>
  );
}
