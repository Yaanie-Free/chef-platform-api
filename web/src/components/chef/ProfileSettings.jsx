"use client";
import React, { useState, useEffect } from 'react';
import { Save, Upload, MapPin, Phone, Mail, Camera, Star, Award, Clock, Users } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function ProfileSettings({ chefData }) {
  const [profile, setProfile] = useState({
    name: '',
    surname: '',
    email: '',
    cell_number: '',
    bio: '',
    work_history: '',
    regions_served: [],
    max_travel_distance: 0,
    dietary_specialties: [],
    holiday_rate_multiplier: 1.5,
    profile_images: [],
    base_rate: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (chefData) {
      setProfile(chefData);
    }
  }, [chefData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/chefs/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${chefData.token}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        // Show success message
        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/chefs/profile/images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${chefData.token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({
          ...prev,
          profile_images: [...prev.profile_images, ...data.uploaded]
        }));
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const southAfricanCities = [
    'Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth',
    'Bloemfontein', 'East London', 'Pietermaritzburg', 'Nelspruit', 'Kimberley',
    'Polokwane', 'Rustenburg', 'Witbank', 'Klerksdorp', 'Welkom'
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut-free',
    'Halaal', 'Kosher', 'Paleo', 'Keto', 'Low-carb'
  ];

  const cuisineTypes = [
    'Italian', 'French', 'Asian', 'Mediterranean', 'South African',
    'Indian', 'Mexican', 'Japanese', 'Thai', 'Chinese'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Profile Settings</h2>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/5 rounded-2xl">
          <TabsTrigger value="basic" className="rounded-xl">Basic Info</TabsTrigger>
          <TabsTrigger value="services" className="rounded-xl">Services</TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-xl">Pricing</TabsTrigger>
          <TabsTrigger value="gallery" className="rounded-xl">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card className="p-6 rounded-3xl border-border/40">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">First Name</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="rounded-2xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Last Name</label>
                <Input
                  value={profile.surname}
                  onChange={(e) => setProfile({ ...profile, surname: e.target.value })}
                  className="rounded-2xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="rounded-2xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone Number</label>
                <Input
                  value={profile.cell_number}
                  onChange={(e) => setProfile({ ...profile, cell_number: e.target.value })}
                  className="rounded-2xl"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-border/40">
            <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell customers about your culinary background and specialties..."
                  className="min-h-[120px] rounded-2xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Work History</label>
                <Textarea
                  value={profile.work_history}
                  onChange={(e) => setProfile({ ...profile, work_history: e.target.value })}
                  placeholder="Describe your professional experience and achievements..."
                  className="min-h-[120px] rounded-2xl"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card className="p-6 rounded-3xl border-border/40">
            <h3 className="text-lg font-semibold mb-4">Service Areas</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Cities You Serve</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {southAfricanCities.map((city) => (
                    <label key={city} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.regions_served.includes(city)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfile(prev => ({
                              ...prev,
                              regions_served: [...prev.regions_served, city]
                            }));
                          } else {
                            setProfile(prev => ({
                              ...prev,
                              regions_served: prev.regions_served.filter(c => c !== city)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{city}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Max Travel Distance (km)</label>
                <Input
                  type="number"
                  value={profile.max_travel_distance}
                  onChange={(e) => setProfile({ ...profile, max_travel_distance: parseInt(e.target.value) })}
                  className="rounded-2xl"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-border/40">
            <h3 className="text-lg font-semibold mb-4">Culinary Specialties</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Cuisine Types</label>
                <div className="flex flex-wrap gap-2">
                  {cuisineTypes.map((cuisine) => (
                    <Badge
                      key={cuisine}
                      variant={profile.dietary_specialties.includes(cuisine) ? "default" : "outline"}
                      className="cursor-pointer rounded-xl"
                      onClick={() => {
                        if (profile.dietary_specialties.includes(cuisine)) {
                          setProfile(prev => ({
                            ...prev,
                            dietary_specialties: prev.dietary_specialties.filter(c => c !== cuisine)
                          }));
                        } else {
                          setProfile(prev => ({
                            ...prev,
                            dietary_specialties: [...prev.dietary_specialties, cuisine]
                          }));
                        }
                      }}
                    >
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Dietary Accommodations</label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((diet) => (
                    <Badge
                      key={diet}
                      variant={profile.dietary_specialties.includes(diet) ? "default" : "outline"}
                      className="cursor-pointer rounded-xl"
                      onClick={() => {
                        if (profile.dietary_specialties.includes(diet)) {
                          setProfile(prev => ({
                            ...prev,
                            dietary_specialties: prev.dietary_specialties.filter(d => d !== diet)
                          }));
                        } else {
                          setProfile(prev => ({
                            ...prev,
                            dietary_specialties: [...prev.dietary_specialties, diet]
                          }));
                        }
                      }}
                    >
                      {diet}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card className="p-6 rounded-3xl border-border/40">
            <h3 className="text-lg font-semibold mb-4">Pricing Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Base Rate (R per person)</label>
                <Input
                  type="number"
                  value={profile.base_rate}
                  onChange={(e) => setProfile({ ...profile, base_rate: parseFloat(e.target.value) })}
                  className="rounded-2xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Holiday Rate Multiplier</label>
                <Input
                  type="number"
                  step="0.1"
                  value={profile.holiday_rate_multiplier}
                  onChange={(e) => setProfile({ ...profile, holiday_rate_multiplier: parseFloat(e.target.value) })}
                  className="rounded-2xl"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Multiplier for public holidays (e.g., 1.5 = 50% increase)
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <Card className="p-6 rounded-3xl border-border/40">
            <h3 className="text-lg font-semibold mb-4">Profile Gallery</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button variant="outline" className="rounded-2xl">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </Button>
                </label>
                <p className="text-sm text-muted-foreground">
                  Upload high-quality images of your work (min 1000px, max 5MB each)
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {profile.profile_images.map((image, index) => (
                  <div key={index} className="relative group">
                    <ImageWithFallback
                      src={image.url}
                      alt={`Profile image ${index + 1}`}
                      className="w-full h-32 rounded-2xl object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setProfile(prev => ({
                            ...prev,
                            profile_images: prev.profile_images.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}