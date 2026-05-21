import { DocumentItem } from "@/components/document/document-item";
import type { DocumentListItem } from "@/types/document";

type Props = { documents: DocumentListItem[] };

export function DocumentList({ documents }: Props) {
  if (documents.length === 0) return null;
  return (
    <ul className="divide-y rounded-lg border bg-background">
      {documents.map((doc) => (
        <li key={doc.id}>
          <DocumentItem document={doc} />
        </li>
      ))}
    </ul>
  );
}
