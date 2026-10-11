import { Link } from "react-router-dom";
import { ImageReveal } from "./Motion";
import { IconArrow } from "./Icons";
import DocumentDownloads from "./DocumentDownloads";

// The card is a <div> (not one big <Link>) so the "Download PDF" button can
// sit inside it — a link can't legally contain another link.
export default function ContentCard({ item }) {
  return (
    <div className="pub contentCard">
      <Link to={`/article/${item.id}`} className="contentCardLink">
        {item.imageUrl && (
          <ImageReveal src={item.imageUrl} alt={item.title} className="contentCardImg" />
        )}
        {item.tag && <span className="tag">{item.tag}</span>}
        <h3>{item.title}</h3>
        {item.author && <p className="contentCardAuthors">{item.author}</p>}
        {item.summary && <p>{item.summary}</p>}
        <span className="cardReadMore">Read More <IconArrow /></span>
      </Link>
      <DocumentDownloads item={item} />
    </div>
  );
}