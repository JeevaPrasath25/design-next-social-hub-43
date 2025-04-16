
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useAIDesignGenerator } from '@/hooks/useAIDesignGenerator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, ImagePlus, Loader2, Save } from 'lucide-react';

const AIDesignGenerator: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const {
    generatingImage,
    savingDesign,
    generatedImage,
    generateImage,
    saveDesignToPortfolio,
    downloadGeneratedImage
  } = useAIDesignGenerator();

  const handleGenerateClick = () => {
    generateImage(prompt);
  };

  const handleSaveClick = async () => {
    const savedPost = await saveDesignToPortfolio();
    if (savedPost && user?.role === 'architect') {
      navigate('/architect-dashboard');
    } else if (savedPost && user?.role === 'homeowner') {
      navigate('/homeowner-dashboard');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>AI Design Generator</CardTitle>
                <CardDescription>
                  Describe your design idea in detail and our AI will generate a visualization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Be specific about architecture details, materials, style, and setting. Example: 'A modern minimalist house with large glass windows, flat roof, concrete and wood exterior, surrounded by pine trees with mountains in the background.'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                </div>
                <Button 
                  onClick={handleGenerateClick} 
                  disabled={generatingImage || !prompt.trim()}
                  className="w-full"
                >
                  {generatingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="mr-2 h-4 w-4" />
                      Generate Design
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Generated Design</CardTitle>
                <CardDescription>
                  Preview your AI-generated design
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="overflow-hidden rounded-md border border-gray-200 w-full aspect-square bg-gray-100 flex items-center justify-center">
                  {generatingImage ? (
                    <Skeleton className="w-full h-full" />
                  ) : generatedImage ? (
                    <img 
                      src={generatedImage} 
                      alt="AI Generated Design" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <ImagePlus className="mx-auto h-12 w-12 mb-2" />
                      <p>Your design will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={downloadGeneratedImage}
                  disabled={!generatedImage || generatingImage}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={handleSaveClick}
                  disabled={!generatedImage || generatingImage || savingDesign}
                >
                  {savingDesign ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save to Portfolio
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIDesignGenerator;
