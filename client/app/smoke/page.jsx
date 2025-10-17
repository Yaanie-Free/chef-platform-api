import React from 'react';
import { Hero, Button, Card, ImageWithFallback } from '../components/ui';

export default function SmokePage() {
  return (
    <div className="p-8">
      <Hero title="Smoke Test" subtitle="Verifying UI components render" cta={<Button>Get Started</Button>} />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-2">Chef card sample</h3>
          <ImageWithFallback src="https://images.unsplash.com/photo-1543353071-087092ec393f" alt="chef" className="w-full h-40 object-cover rounded-md" />
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-2">Buttons</h3>
          <div className="flex gap-3">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
