import { Link } from "react-router-dom";
import { ImageReveal } from "./Motion";

export default function ContentCard({ item }) {
  return (
    <Link to={`/article/${item.id}`} className="pub contentCard">
      {item.imageUrl && (
        <ImageReveal src={item.imageUrl} alt={item.title} className="contentCardImg" />
      )}
      {item.tag && <span className="tag">{item.tag}</span>}
      <h3>{item.title}</h3>
      {item.summary && <p>{item.summary}</p>}
    </Link>
  );
}