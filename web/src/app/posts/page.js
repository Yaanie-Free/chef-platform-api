import React from "react";
import { PostsManager } from "@/components/chef/PostsManager";

export default function PostsPage() {
  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      <PostsManager chefData={{}} />
    </div>
  );
}
