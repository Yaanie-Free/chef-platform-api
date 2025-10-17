import React, { useState, useRef } from 'react';
import { Plus, Image as ImageIcon, X, Heart, MessageCircle, Eye } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function PostsManager({ chefData }) {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postCaption, setPostCaption] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);

  const mockPosts = [
    { id: '1', images: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=800', 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800'], caption: 'Fresh handmade pasta with truffle cream sauce. One of my favourite dishes to prepare! 🍝✨', date: '2025-10-08', likes: 156, comments: 23, views: 890 },
    { id: '2', images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'], caption: 'Beautiful Italian feast prepared for a wonderful family celebration in Camps Bay. Thank you for having me! 🇮🇹', date: '2025-10-05', likes: 198, comments: 31, views: 1240 },
    { id: '3', images: ['https://images.unsplash.com/photo-1558818498-28c1e002b655?w=800'], caption: 'Wine pairing perfection. Creating memorable dining experiences, one plate at a time. 🍷', date: '2025-10-01', likes: 142, comments: 18, views: 756 }
  ];

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = () => {
    console.log('Creating post:', { caption: postCaption, images: selectedImages });
    setPostCaption('');
    setSelectedImages([]);
    setIsCreatingPost(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-2">Your posts</h2>
          <p className="text-muted-foreground">Share your culinary creations with potential clients</p>
        </div>
        <Button onClick={() => setIsCreatingPost(!isCreatingPost)} className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600">
          <Plus className="w-4 h-4 mr-2" />
          Create post
        </Button>
      </div>

      {isCreatingPost && (
        <Card className="p-6 rounded-3xl border-border/40">
          <h3 className="text-lg mb-4">Create a new post</h3>
          <div className="space-y-4">
            <Textarea placeholder="Write a caption for your post..." value={postCaption} onChange={(e) => setPostCaption(e.target.value)} className="rounded-2xl min-h-[120px] resize-none" />

            <div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />

              {selectedImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative rounded-2xl overflow-hidden aspect-square">
                      <ImageWithFallback src={image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                      <Button variant="destructive" size="sm" className="absolute top-2 right-2 rounded-full w-8 h-8 p-0" onClick={() => removeImage(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {selectedImages.length < 4 && (
                    <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-white/50 transition-colors flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10">
                      <Plus className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Add more</span>
                    </button>
                  )}
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="w-full h-48 rounded-2xl border-2 border-dashed border-border hover:border-white/50 transition-colors flex flex-col items-center justify-center gap-3 bg-white/5 hover:bg-white/10">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm">Click to add photos</p>
                    <p className="text-xs text-muted-foreground mt-1">Add up to 4 images</p>
                  </div>
                </button>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setIsCreatingPost(false); setPostCaption(''); setSelectedImages([]); }} className="rounded-2xl">Cancel</Button>
              <Button onClick={handleCreatePost} disabled={!postCaption.trim() || selectedImages.length === 0} className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600">Publish post</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockPosts.map((post) => (
          <Card key={post.id} className="rounded-3xl border-border/40 overflow-hidden">
            <div className="relative aspect-square bg-white/5">
              {post.images.length === 1 ? (
                <ImageWithFallback src={post.images[0]} alt="Post" className="w-full h-full object-cover" />
              ) : (
                <div className="grid grid-cols-2 gap-1 w-full h-full">
                  {post.images.map((image, index) => (
                    <ImageWithFallback key={index} src={image} alt={`Post ${index + 1}`} className="w-full h-full object-cover" />
                  ))}
                </div>
              )}
              {post.images.length > 1 && (
                <Badge className="absolute top-3 right-3 rounded-xl bg-black/60 text-white border-none">1/{post.images.length}</Badge>
              )}
            </div>

            <div className="p-4 space-y-3">
              <p className="text-sm leading-relaxed">{post.caption}</p>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-border/40">
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{post.views}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
