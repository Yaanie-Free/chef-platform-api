import React from "react";
import { ReviewsManager } from "@/components/chef/ReviewsManager";

export default function ReviewsPage() {
  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      <ReviewsManager chefData={{}} totalLikes={712} />
    </div>
  );
}
