import { Link } from "react-router-dom";

export default function ContentCard({ item }) {
  return (
    <Link to={`/article/${item.id}`} className="pub contentCard">
      {item.imageUrl && (
        <div className="contentCardImg">
          <img src={item.imageUrl} alt={item.title} loading="lazy" />
        </div>
      )}
      {item.tag && <span className="tag">{item.tag}</span>}
      <h3>{item.title}</h3>
      {item.summary && <p>{item.summary}</p>}
    </Link>
  );
}
