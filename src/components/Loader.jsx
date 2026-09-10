export default function Loader({ full }) {
  return (
    <div className={full ? "loaderFull" : "loaderInline"}>
      <div className="spinner" />
    </div>
  );
}
