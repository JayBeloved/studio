"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { generateSariPost } from "@/ai/flows/generate-sari-post";
import { refineGeneratedPost } from "@/ai/flows/refine-generated-post";
import { type GenerateSariPostOutput } from "@/ai/flows/sari-post.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Award, Target, Send, Copy, Wand2, Loader2, Sparkles } from "lucide-react";

const voiceConfigs = [
  { 
    id: "storytelling", 
    label: "Storytelling", 
    icon: BookOpen,
    contentPlaceholder: "Share your experience, moment, or personal journey...",
    frameworks: [ 
      { id: "BAB", label: "BAB (Before-After-Bridge)" }, 
      { id: "Hero", label: "Hero's Journey" }, 
      { id: "Mountain", label: "The Mountain" } 
    ] 
  },
  { 
    id: "authority", 
    label: "Authority", 
    icon: Award,
    contentPlaceholder: "Share your insight, framework, or contrarian perspective...",
    frameworks: [ 
      { id: "PAS", label: "PAS (Problem-Agitate-Solve)" }, 
      { id: "Thesis", label: "Thesis-Antithesis-Synthesis" }, 
      { id: "4Ps", label: "4Ps (Picture-Promise-Proof-Push)" } 
    ] 
  },
  { 
    id: "relevance", 
    label: "Relevance", 
    icon: Target,
    contentPlaceholder: "Describe the myth, trend, or observation you're noticing...",
    frameworks: [ 
      { id: "Myth", label: "Myth vs. Reality" }, 
      { id: "Trend", label: "Trend Analysis" }, 
      { id: "AMA", label: "AMA (Ask Me Anything)" } 
    ] 
  },
  { 
    id: "invitation", 
    label: "Invitation", 
    icon: Send,
    contentPlaceholder: "Share what you're observing, offering, or celebrating...",
    frameworks: [ 
      { id: "Question", label: "The Genuine Question" }, 
      { id: "Understand", label: "Help Me Understand" }, 
      { id: "Gift", label: "Resource/Gift Frame" }, 
      { id: "Celebrate", label: "Celebration/Recognition" } 
    ] 
  },
] as const;

const tones = [
  "vulnerable", "inspirational", "analytical", "educational", 
  "celebratory", "provocative", "curious", "generous"
] as const;

const formSchema = z.object({
  voiceType: z.enum(["storytelling", "authority", "relevance", "invitation"]),
  framework: z.string().min(1, { message: "Please select a framework." }),
  wordCount: z.coerce.number().min(50).max(1000),
  tone: z.enum(tones),
  content: z.string().min(10, { message: "Please provide some content." }),
});

export function PostGenerator() {
  const [generatedPost, setGeneratedPost] = useState<GenerateSariPostOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refinementInput, setRefinementInput] = useState("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voiceType: "storytelling",
      framework: "BAB",
      wordCount: 300,
      tone: "inspirational",
      content: "",
    },
  });

  const voiceType = form.watch("voiceType");
  const selectedVoiceConfig = voiceConfigs.find(vc => vc.id === voiceType);

  async function onGenerate(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedPost(null);
    setRefinementInput("");
    
    try {
      const result = await generateSariPost({
        voiceType: data.voiceType,
        framework: data.framework,
        wordCount: data.wordCount,
        tone: data.tone,
        content: data.content,
      });
      
      setGeneratedPost(result);
      toast({
        title: "Post generated!",
        description: "Your LinkedIn post is ready for review.",
      });
    } catch (error) {
      console.error("Error generating post:", error);
      toast({
        variant: "destructive",
        title: "Error generating post",
        description: error instanceof Error ? error.message : "Please try again with different inputs.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onRefine() {
    if (!generatedPost || !refinementInput.trim()) {
      toast({
        variant: "destructive",
        title: "Refinement needed",
        description: "Please provide refinement instructions.",
      });
      return;
    }

    setIsRefining(true);
    try {
      const result = await refineGeneratedPost({
        initialPost: generatedPost.post,
        refinementInstructions: refinementInput,
      });
      
      setGeneratedPost(prev => 
        prev ? { ...prev, post: result.refinedPost } : null
      );
      setRefinementInput("");
      
      toast({
        title: "Post refined!",
        description: "Your post has been updated.",
      });
    } catch (error) {
      console.error("Error refining post:", error);
      toast({
        variant: "destructive",
        title: "Error refining post",
        description: "Please try again.",
      });
    } finally {
      setIsRefining(false);
    }
  }

  const copyToClipboard = () => {
    if (!generatedPost?.post) return;
    
    navigator.clipboard.writeText(generatedPost.post);
    toast({
      title: "Copied!",
      description: "Your LinkedIn post is ready to paste.",
    });
  };

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGeneratedPost(prev => 
      prev ? { ...prev, post: e.target.value } : null
    );
  };

  return (
    <div className="w-full max-w-4xl space-y-8 pb-12">
      {/* Step 1: Configuration */}
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Step 1: Configure Your Post
              </CardTitle>
              <CardDescription>Choose your voice type, framework, tone, and provide your content.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Voice Type Selection */}
              <FormField
                control={form.control}
                name="voiceType"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-base font-semibold">1. Voice Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                      >
                        {voiceConfigs.map(vc => {
                          const Icon = vc.icon;
                          return (
                            <FormItem key={vc.id} className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <div
                                  className={cn(
                                    "rounded-lg border-2 bg-card p-4 transition-all cursor-pointer hover:shadow-md",
                                    field.value === vc.id
                                      ? "border-primary ring-2 ring-primary ring-offset-2"
                                      : "border-border"
                                  )}
                                >
                                  <RadioGroupItem value={vc.id} id={vc.id} className="sr-only" />
                                  <FormLabel
                                    htmlFor={vc.id}
                                    className="font-semibold cursor-pointer flex items-center gap-2"
                                  >
                                    <Icon className="h-4 w-4" />
                                    {vc.label}
                                  </FormLabel>
                                </div>
                              </FormControl>
                            </FormItem>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Framework Selection */}
              {selectedVoiceConfig && (
                <FormField
                  control={form.control}
                  name="framework"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-base font-semibold">2. Framework</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                        >
                          {selectedVoiceConfig.frameworks.map(fw => (
                            <FormItem key={fw.id} className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <div
                                  className={cn(
                                    "rounded-lg border-2 bg-card p-4 transition-all cursor-pointer hover:shadow-md w-full",
                                    field.value === fw.id
                                      ? "border-primary ring-2 ring-primary ring-offset-2"
                                      : "border-border"
                                  )}
                                >
                                  <RadioGroupItem value={fw.id} id={fw.id} className="sr-only" />
                                  <FormLabel
                                    htmlFor={fw.id}
                                    className="font-medium cursor-pointer"
                                  >
                                    {fw.label}
                                  </FormLabel>
                                </div>
                              </FormControl>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* Word Count & Tone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="wordCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">3. Word Count</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="300"
                          min="50"
                          max="1000"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">4. Tone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tones.map(tone => (
                            <SelectItem key={tone} value={tone}>
                              {tone.charAt(0).toUpperCase() + tone.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* Main Content */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">5. Your Content</FormLabel>
                    <FormDescription>
                      {selectedVoiceConfig?.contentPlaceholder}
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={7}
                        placeholder={selectedVoiceConfig?.contentPlaceholder}
                        className="resize-y"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter>
              <Button 
                type="submit" 
                disabled={isLoading} 
                size="lg"
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Post...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Post
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Step 2: Generated Post Review */}
      {(isLoading || generatedPost) && (
        <Card className="animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Step 2: Review & Refine Your Post
            </CardTitle>
            <CardDescription>Edit, refine, or regenerate your post.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Editable Post Content */}
            <div className="relative">
              <Label className="text-base font-semibold mb-2 block">Post Content</Label>
              <Textarea
                value={generatedPost?.post || ""}
                onChange={handlePostChange}
                placeholder={isLoading ? "Generating your post..." : "Your post will appear here..."}
                rows={14}
                className="resize-y font-sm"
                disabled={isLoading}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Copy Button */}
            <div className="flex justify-end gap-2">
              <Button 
                onClick={copyToClipboard} 
                variant="outline" 
                disabled={!generatedPost?.post || isLoading}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>
            </div>

            <Separator />

            {/* Metadata */}
            {generatedPost && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Hashtags</h4>
                  <p className="text-sm text-muted-foreground">{generatedPost.hashtags}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Expected Engagement</h4>
                  <p className="text-sm text-muted-foreground">{generatedPost.engagementPrediction}</p>
                </div>
              </div>
            )}

            {generatedPost?.qualityCheck && (
              <div className="space-y-2 bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-sm">Quality Checklist</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {generatedPost.qualityCheck}
                </p>
              </div>
            )}

            <Separator />

            {/* Refinement Section - FIXED: Not inside Form */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-base mb-2">Refine with AI</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Give specific instructions to improve your post.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <Input
                  value={refinementInput}
                  onChange={(e) => setRefinementInput(e.target.value)}
                  placeholder="e.g., 'Make it shorter' or 'Add more emojis' or 'Make it more provocative'"
                  disabled={isRefining || isLoading || !generatedPost}
                  className="flex-grow"
                />
                <Button 
                  onClick={onRefine} 
                  disabled={isRefining || isLoading || !generatedPost || !refinementInput.trim()}
                  className="w-full sm:w-auto"
                >
                  {isRefining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refining...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Refine
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
