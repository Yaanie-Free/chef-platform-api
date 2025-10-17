"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, Calendar, MapPin, Heart, MessageCircle, Share2, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

export function PostsManager({ chefData }) {
  const [posts, setPosts] = useState([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    images: [],
    location: '',
    tags: []
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/chefs/posts', {
        headers: {
          'Authorization': `Bearer ${chefData.token}`
        }
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const createPost = async () => {
    try {
      const response = await fetch('/api/chefs/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${chefData.token}`
        },
        body: JSON.stringify(newPost)
      });

      if (response.ok) {
        setNewPost({ content: '', images: [], location: '', tags: [] });
        setIsCreatingPost(false);
        loadPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const deletePost = async (postId) => {
    try {
      const response = await fetch(`/api/chefs/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${chefData.token}`
        }
      });

      if (response.ok) {
        loadPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = (now - postTime) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">My Posts</h2>
        <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Textarea
                  placeholder="What's cooking? Share your latest culinary creation..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="min-h-[120px] rounded-2xl"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add location (optional)"
                  value={newPost.location}
                  onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
                  className="rounded-2xl"
                />
                <Button variant="outline" className="rounded-2xl">
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className="rounded-2xl">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Add Photos
                </Button>
                <Button variant="outline" className="rounded-2xl">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreatingPost(false)} className="rounded-2xl">
                  Cancel
                </Button>
                <Button onClick={createPost} className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500">
                  Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <Card className="p-12 rounded-3xl border-border/40 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-4">
              Share your culinary journey with your customers
            </p>
            <Button onClick={() => setIsCreatingPost(true)} className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Post
            </Button>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="p-6 rounded-3xl border-border/40">
              <div className="flex items-start gap-4">
                <ImageWithFallback
                  src={chefData.profileImage || '/placeholder-chef.jpg'}
                  alt={chefData.name}
                  className="w-12 h-12 rounded-2xl object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{chefData.name} {chefData.surname}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatTimeAgo(post.created_at)}</span>
                        {post.location && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {post.location}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="rounded-2xl">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm mb-4 leading-relaxed">{post.content}</p>

                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {post.images.slice(0, 4).map((image, index) => (
                        <ImageWithFallback
                          key={index}
                          src={image.url}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-32 rounded-2xl object-cover"
                        />
                      ))}
                    </div>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="rounded-xl">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <Button variant="ghost" size="sm" className="rounded-2xl">
                        <Heart className="w-4 h-4 mr-2" />
                        {post.likes || 0}
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-2xl">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {post.comments || 0}
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-2xl">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="rounded-2xl">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-2xl text-destructive hover:text-destructive"
                        onClick={() => deletePost(post.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}