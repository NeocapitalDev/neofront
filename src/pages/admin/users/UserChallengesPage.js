"use client";

import UserChallengesTable from "./UserChallengesTable";
import { useSearchParams } from "next/navigation";

export default function UserChallengesPage() {
  const params = useSearchParams();
  const userId = params.get("id");
  const documentId = params.get("documentId");

  if (!userId || !documentId) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error: Faltan parámetros para mostrar los desafíos.</p>
      </div>
    );
  }

  return <UserChallengesTable userId={parseInt(userId, 10)} documentId={documentId} />;
}
