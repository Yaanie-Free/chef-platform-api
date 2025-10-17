"use client";
import React, { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Upload, DollarSign, Award, Utensils, Save } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function ProfileSettings({ chefData }) {
  const [profileData, setProfileData] = useState(chefData || {});
  const [hasChanges, setHasChanges] = useState(false);
  const mainImageInputRef = useRef(null);

  const specialtyOptions = ['Italian', 'French', 'Japanese', 'Chinese', 'Indian', 'Thai','Mediterranean', 'African Fusion', 'South African', 'Spanish','Mexican', 'Vegan', 'Vegetarian', 'Fine Dining', 'BBQ & Braai','Seafood', 'Pastry & Desserts', 'Wine Pairing'];

  const certificationOptions = ['Culinary Arts Degree', 'Professional Chef Certificate','Food Safety & Hygiene', 'Wine Sommelier', 'Pastry Specialist','Michelin Experience', 'International Training'];

  const updateProfileData = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSpecialtyChange = (specialty, checked) => {
    const currentSpecialties = profileData.specialties || [];
    if (checked) updateProfileData('specialties', [...currentSpecialties, specialty]);
    else updateProfileData('specialties', currentSpecialties.filter((s) => s !== specialty));
  };

  const handleCertificationChange = (certification, checked) => {
    const currentCerts = profileData.certifications || [];
    if (checked) updateProfileData('certifications', [...currentCerts, certification]);
    else updateProfileData('certifications', currentCerts.filter((c) => c !== certification));
  };

  const handleMainImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateProfileData('mainImagePreview', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    console.log('Saving profile changes:', profileData);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-2">Profile settings</h2>
          <p className="text-muted-foreground">Manage your profile information and preferences</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSaveChanges} className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600">
            <Save className="w-4 h-4 mr-2" />
            Save changes
          </Button>
        )}
      </div>

      <Card className="p-6 rounded-3xl border-border/40">
        <h3 className="text-lg mb-4">Profile photo</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            {profileData.mainImagePreview ? (
              <ImageWithFallback src={profileData.mainImagePreview} alt="Profile" className="w-24 h-24 rounded-2xl object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-white/5 flex items-center justify-center">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <Button variant="outline" onClick={() => mainImageInputRef.current?.click()} className="rounded-2xl">
              <Upload className="w-4 h-4 mr-2" />
              Upload new photo
            </Button>
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max size 10MB. Recommended 800x800px.</p>
            <input ref={mainImageInputRef} type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
          </div>
        </div>
      </Card>

      <Card className="p-6 rounded-3xl border-border/40">
        <h3 className="text-lg mb-4">Personal information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              First name
            </Label>
            <Input id="firstName" value={profileData.firstName || ''} onChange={(e) => updateProfileData('firstName', e.target.value)} className="rounded-2xl" />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" value={profileData.lastName || ''} onChange={(e) => updateProfileData('lastName', e.target.value)} className="rounded-2xl" />
          </div>
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email address
            </Label>
            <Input id="email" type="email" value={profileData.email || ''} onChange={(e) => updateProfileData('email', e.target.value)} className="rounded-2xl" />
          </div>
          <div>
            <Label htmlFor="mobile" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Mobile number
            </Label>
            <Input id="mobile" type="tel" value={profileData.mobile || ''} onChange={(e) => updateProfileData('mobile', e.target.value)} className="rounded-2xl" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="city" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Primary location
            </Label>
            <Select value={profileData.city || ''} onValueChange={(value) => updateProfileData('city', value)}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cape-town">Cape Town</SelectItem>
                <SelectItem value="johannesburg">Johannesburg</SelectItem>
                <SelectItem value="durban">Durban</SelectItem>
                <SelectItem value="pretoria">Pretoria</SelectItem>
                <SelectItem value="port-elizabeth">Port Elizabeth</SelectItem>
                <SelectItem value="bloemfontein">Bloemfontein</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6 rounded-3xl border-border/40">
        <h3 className="text-lg mb-4">Professional bio</h3>
        <Textarea placeholder="Tell potential clients about your culinary journey, training, and passion for cooking..." value={profileData.bio || ''} onChange={(e) => updateProfileData('bio', e.target.value)} className="rounded-2xl min-h-[120px] resize-none" maxLength={500} />
        <p className="text-xs text-muted-foreground mt-2">{(profileData.bio || '').length}/500 characters</p>
      </Card>

      <Card className="p-6 rounded-3xl border-border/40">
        <h3 className="text-lg mb-4 flex items-center gap-2">
          <Utensils className="w-5 h-5" />
          Culinary specialties
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {specialtyOptions.map((specialty) => (
            <div key={specialty} className="flex items-center space-x-2 p-3 rounded-2xl border border-border hover:bg-accent/50 transition-colors">
              <Checkbox id={`specialty-${specialty}`} checked={(profileData.specialties || []).includes(specialty)} onCheckedChange={(checked) => handleSpecialtyChange(specialty, !!checked)} />
              <Label htmlFor={`specialty-${specialty}`} className="flex-1 cursor-pointer text-sm">{specialty}</Label>
            </div>
          ))}
        </div>
        {(profileData.specialties || []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profileData.specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary" className="rounded-xl">{specialty}</Badge>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 rounded-3xl border-border/40">
        <h3 className="text-lg mb-4">Experience & pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="experience">Years of experience</Label>
            <Select value={profileData.experience || ''} onValueChange={(value) => updateProfileData('experience', value)}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-3">1-3 years</SelectItem>
                <SelectItem value="4-7">4-7 years</SelectItem>
                <SelectItem value="8-12">8-12 years</SelectItem>
                <SelectItem value="13-20">13-20 years</SelectItem>
                <SelectItem value="20+">20+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="priceMin" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Min price (R per person)
            </Label>
            <Input id="priceMin" type="number" value={profileData.priceRangeMin || ''} onChange={(e) => updateProfileData('priceRangeMin', e.target.value)} className="rounded-2xl" placeholder="450" />
          </div>
          <div>
            <Label htmlFor="priceMax">Max price (R per person)</Label>
            <Input id="priceMax" type="number" value={profileData.priceRangeMax || ''} onChange={(e) => updateProfileData('priceRangeMax', e.target.value)} className="rounded-2xl" placeholder="650" />
          </div>
        </div>
      </Card>

      <Card className="p-6 rounded-3xl border-border/40">
        <h3 className="text-lg mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Certifications & credentials
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {certificationOptions.map((certification) => (
            <div key={certification} className="flex items-center space-x-2 p-3 rounded-2xl border border-border hover:bg-accent/50 transition-colors">
              <Checkbox id={`cert-${certification}`} checked={(profileData.certifications || []).includes(certification)} onCheckedChange={(checked) => handleCertificationChange(certification, !!checked)} />
              <Label htmlFor={`cert-${certification}`} className="flex-1 cursor-pointer text-sm">{certification}</Label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
