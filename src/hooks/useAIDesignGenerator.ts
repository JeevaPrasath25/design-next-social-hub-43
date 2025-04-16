
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useAIDesignGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [savingDesign, setSavingDesign] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const { user } = useAuth();

  const generateImage = async (designPrompt: string) => {
    if (!designPrompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a design description to generate an image.",
        variant: "destructive"
      });
      return;
    }

    try {
      setGeneratingImage(true);
      setPrompt(designPrompt);

      // Call the Supabase Edge Function for image generation
      const { data, error } = await supabase.functions.invoke('generate-design', {
        body: { prompt: designPrompt }
      });

      if (error) throw error;

      if (data?.output && Array.isArray(data.output) && data.output.length > 0) {
        setGeneratedImage(data.output[0]);
      } else {
        throw new Error('Failed to generate image');
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast({
        title: "Generation failed",
        description: error.message || "An error occurred while generating the image.",
        variant: "destructive"
      });
      setGeneratedImage(null);
    } finally {
      setGeneratingImage(false);
    }
  };

  const saveDesignToPortfolio = async () => {
    if (!generatedImage || !user) {
      toast({
        title: "Cannot save design",
        description: "No image generated or user not logged in.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSavingDesign(true);

      // Download the image
      const response = await fetch(generatedImage);
      const blob = await response.blob();

      // Create a unique file name
      const fileName = `${user.id}_${Date.now()}.webp`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ai_designs')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('ai_designs')
        .getPublicUrl(fileName);

      // Create post in the database
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          title: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
          description: prompt,
          image_url: publicUrlData.publicUrl,
          user_id: user.id,
          design_type: 'AI-Generated',
          tags: ['ai-generated', 'design'],
          hire_me: true
        })
        .select()
        .single();

      if (postError) throw postError;

      toast({
        title: "Design saved",
        description: "Your AI-generated design has been saved to your portfolio.",
      });
      
      return postData;
    } catch (error: any) {
      console.error('Error saving design:', error);
      toast({
        title: "Save failed",
        description: error.message || "An error occurred while saving the design.",
        variant: "destructive"
      });
      return null;
    } finally {
      setSavingDesign(false);
    }
  };

  const downloadGeneratedImage = async () => {
    if (!generatedImage) {
      toast({
        title: "Cannot download",
        description: "No image has been generated yet.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Fetch the image
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-design-${Date.now()}.webp`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download complete",
        description: "The AI-generated design has been downloaded.",
      });
    } catch (error: any) {
      console.error('Error downloading image:', error);
      toast({
        title: "Download failed",
        description: error.message || "An error occurred while downloading the image.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generatingImage,
    savingDesign,
    generatedImage,
    prompt,
    setPrompt,
    generateImage,
    saveDesignToPortfolio,
    downloadGeneratedImage
  };
};
