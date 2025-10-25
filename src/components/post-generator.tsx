"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { generateSariPost, GenerateSariPostInput } from "@/ai/flows/generate-sari-post";
import { refineGeneratedPost } from "@/ai/flows/refine-generated-post";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Award, Target, Send, Copy, Wand2, Loader2, Sparkles } from "lucide-react";

const sariItems = [
  {
    id: "storytelling",
    label: "Storytelling",
    description: "Engage with a compelling narrative.",
    icon: BookOpen,
  },
  {
    id: "authority",
    label: "Authority",
    description: "Establish credibility and expertise.",
    icon: Award,
  },
  {
    id: "relevance",
    label: "Relevance",
    description: "Connect with audience needs.",
    icon: Target,
  },
  {
    id: "invitation",
    label: "Invitation",
    description: "Encourage interaction and response.",
    icon: Send,
  },
] as const;

type SariFields = Record<(typeof sariItems)[number]["id"], boolean>;
const sariFormSchema = z.object(
  sariItems.reduce((acc, item) => {
    acc[item.id] = z.boolean().default(false);
    return acc;
  }, {} as Record<keyof SariFields, z.ZodBoolean>)
).refine(data => Object.values(data).some(v => v), {
  message: "Please select at least one category.",
});

const refineFormSchema = z.object({
  refinementInstructions: z.string().min(1, { message: "Please enter refinement instructions." }),
});

export function PostGenerator() {
  const [generatedPost, setGeneratedPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const { toast } = useToast();

  const sariForm = useForm<z.infer<typeof sariFormSchema>>({
    resolver: zodResolver(sariFormSchema),
    defaultValues: {
      storytelling: true,
      authority: false,
      relevance: true,
      invitation: false,
    },
  });

  const refineForm = useForm<z.infer<typeof refineFormSchema>>({
    resolver: zodResolver(refineFormSchema),
    defaultValues: { refinementInstructions: "" },
  });

  async function onGenerate(data: z.infer<typeof sariFormSchema>) {
    setIsLoading(true);
    setGeneratedPost("");
    try {
      const result = await generateSariPost(data as GenerateSariPostInput);
      setGeneratedPost(result.post);
    } catch (error) {
      console.error("Error generating post:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate post. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onRefine(data: z.infer<typeof refineFormSchema>) {
    setIsRefining(true);
    try {
      const result = await refineGeneratedPost({
        initialPost: generatedPost,
        refinementInstructions: data.refinementInstructions,
      });
      setGeneratedPost(result.refinedPost);
      refineForm.reset();
    } catch (error) {
      console.error("Error refining post:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refine post. Please try again.",
      });
    } finally {
      setIsRefining(false);
    }
  }

  const copyToClipboard = () => {
    if (!generatedPost) return;
    navigator.clipboard.writeText(generatedPost);
    toast({
      title: "Copied to clipboard!",
      description: "Your LinkedIn post is ready to be pasted.",
    });
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
      <Card>
        <Form {...sariForm}>
          <form onSubmit={sariForm.handleSubmit(onGenerate)} className="space-y-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span>1. Configure your Post</span>
              </CardTitle>
              <CardDescription>Select the SARI framework elements to include in your post.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {sariItems.map((item) => (
                  <FormField
                    key={item.id}
                    control={sariForm.control}
                    name={item.id}
                    render={({ field }) => (
                      <div className={cn(
                          "rounded-lg border bg-card p-4 transition-all hover:shadow-md has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary",
                        )}>
                        <FormItem className="flex items-start space-x-3">
                          <FormControl>
                            <Checkbox id={item.id} checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1.5 leading-none">
                            <FormLabel htmlFor={item.id} className="cursor-pointer">
                              <div className="flex items-center gap-2 font-semibold">
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                              </div>
                            </FormLabel>
                            <FormDescription className="cursor-pointer" onClick={() => sariForm.setValue(item.id, !field.value)}>
                              {item.description}
                            </FormDescription>
                          </div>
                        </FormItem>
                      </div>
                    )}
                  />
                ))}
              </div>
              {sariForm.formState.errors.root && <p className="text-sm font-medium text-destructive">{sariForm.formState.errors.root.message}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                ) : (
                  <><Wand2 className="mr-2 h-4 w-4" />Generate Post</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {(isLoading || generatedPost) && (
        <Card className="animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle>2. Your Generated Post</CardTitle>
            <CardDescription>Review, edit, and refine your AI-generated post below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                value={generatedPost}
                onChange={(e) => setGeneratedPost(e.target.value)}
                placeholder={isLoading ? "Generating your post..." : "Your post will appear here..."}
                rows={12}
                className="resize-y"
                disabled={isLoading}
              />
              {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-background/50"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}
            </div>
            <div className="flex justify-end">
              <Button onClick={copyToClipboard} variant="outline" disabled={!generatedPost || isLoading}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Post
              </Button>
            </div>
            
            <Separator />

            <div>
              <h3 className="text-md font-semibold">Refine with AI</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Give instructions to improve the post.</p>
              <Form {...refineForm}>
                <form onSubmit={refineForm.handleSubmit(onRefine)} className="flex w-full flex-col gap-2 sm:flex-row">
                  <FormField
                    control={refineForm.control}
                    name="refinementInstructions"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input placeholder="e.g., 'Make it shorter and add more emojis'" {...field} disabled={isRefining || isLoading} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isRefining || isLoading} className="w-full sm:w-auto">
                    {isRefining ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Refining...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" />Refine</>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
