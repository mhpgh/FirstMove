import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/lib/auth";

const pairingSchema = z.object({
  pairingCode: z.string().length(6, "Pairing code must be 6 characters"),
});

type PairingFormData = z.infer<typeof pairingSchema>;

interface PairingPageProps {
  user: User;
  onPairingSuccess: () => void;
}

export default function PairingPage({ user, onPairingSuccess }: PairingPageProps) {
  const [pairingCode, setPairingCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const form = useForm<PairingFormData>({
    resolver: zodResolver(pairingSchema),
    defaultValues: {
      pairingCode: "",
    },
  });

  const generatePairingCode = async () => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/pairing/generate", {
        userId: user.id,
      });
      const data = await response.json();
      setPairingCode(data.pairingCode);
      toast({
        title: "Pairing code generated",
        description: "Share this code with your partner",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate pairing code",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pairingCode);
      toast({
        title: "Copied!",
        description: "Pairing code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: PairingFormData) => {
    setIsJoining(true);
    try {
      const response = await apiRequest("POST", "/api/pairing/join", {
        userId: user.id,
        pairingCode: data.pairingCode,
      });
      
      toast({
        title: "Success",
        description: "Successfully paired with your partner!",
      });
      onPairingSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid pairing code",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-white text-xl" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Connect with Your Partner
          </CardTitle>
          <p className="text-gray-600">
            Generate a code or enter your partner's code to start
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate Code</TabsTrigger>
              <TabsTrigger value="join">Join Partner</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generate" className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Generate a pairing code for your partner to join
                </p>
                
                {pairingCode ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="text-3xl font-mono tracking-widest text-center text-gray-800">
                        {pairingCode}
                      </div>
                    </div>
                    
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="w-full"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </Button>
                    
                    <p className="text-xs text-gray-500">
                      Share this code with your partner. It will expire once used.
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={generatePairingCode}
                    disabled={isGenerating}
                    className="w-full gradient-bg text-white hover:opacity-90"
                  >
                    {isGenerating ? "Generating..." : "Generate Pairing Code"}
                  </Button>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="join" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Enter the pairing code your partner shared with you
                </p>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="pairingCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pairing Code</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter 6-character code"
                              className="text-center font-mono tracking-widest text-lg"
                              maxLength={6}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value.toUpperCase();
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full gradient-bg text-white hover:opacity-90"
                      disabled={isJoining}
                    >
                      {isJoining ? "Connecting..." : "Connect with Partner"}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
