import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TaskFourResponse, taskFourResponseSchema, WorkflowTask } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function TaskFour() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: workflow, isLoading } = useQuery<WorkflowTask>({
    queryKey: [`/api/workflow/${id}`],
  });

  const form = useForm<TaskFourResponse>({
    resolver: zodResolver(taskFourResponseSchema),
    defaultValues: {
      overallRubricsCompleteness: 1,
      overallRubricsClarity: 1,
      overallRubricsFlexibility: 1,
      evaluateRubricsRationale: "",
    },
  });

  const formValues = form.watch();

  const mutation = useMutation({
    mutationFn: async (data: TaskFourResponse) => {
      console.log("Submitting Task 4 data:", data);
      const response = await apiRequest("PATCH", `/api/workflow/${id}/task-four`, data);
      console.log("Task 4 submission response:", response);
      return response;
    },
    onSuccess: () => {
      console.log("Task 4 submission successful");
      toast({
        title: "Success",
        description: "Task 4 responses saved. Workflow complete!",
      });
    },
    onError: (error) => {
      console.error("Task 4 submission error:", error);
      toast({
        title: "Error",
        description: "Failed to save responses. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !workflow) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Task 4: Evaluate the Rubric</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="step1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="step1">Step 1: Evaluate the Rubric</TabsTrigger>
                <TabsTrigger value="step2">Step 2: Review and Submit</TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
                  <TabsContent value="step1">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="font-medium">1. Evaluate the Rubric:</h3>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label>Overall Rubrics Completeness</Label>
                            <Slider
                              min={1}
                              max={4}
                              step={1}
                              defaultValue={[formValues.overallRubricsCompleteness]}
                              onValueChange={([v]) => form.setValue("overallRubricsCompleteness", v)}
                            />
                            <p className="text-sm text-muted-foreground">
                              Current value: {formValues.overallRubricsCompleteness}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Overall Rubrics Clarity</Label>
                            <Slider
                              min={1}
                              max={4}
                              step={1}
                              defaultValue={[formValues.overallRubricsClarity]}
                              onValueChange={([v]) => form.setValue("overallRubricsClarity", v)}
                            />
                            <p className="text-sm text-muted-foreground">
                              Current value: {formValues.overallRubricsClarity}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Overall Rubrics Flexibility</Label>
                            <Slider
                              min={1}
                              max={4}
                              step={1}
                              defaultValue={[formValues.overallRubricsFlexibility]}
                              onValueChange={([v]) => form.setValue("overallRubricsFlexibility", v)}
                            />
                            <p className="text-sm text-muted-foreground">
                              Current value: {formValues.overallRubricsFlexibility}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">2. Evaluate Rubrics Rationale:</h3>
                        <Textarea {...form.register("evaluateRubricsRationale")} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="step2">
                    <div className="space-y-6">
                      <h3 className="font-semibold">Review and Submit</h3>
                      <div className="bg-muted p-4 rounded-lg space-y-6">
                        <div>
                          <h4 className="font-medium mb-4">1. Evaluate the Rubric:</h4>
                          <ul className="list-disc ml-6">
                            <li>Overall Rubrics Completeness: {formValues.overallRubricsCompleteness}/4</li>
                            <li>Overall Rubrics Clarity: {formValues.overallRubricsClarity}/4</li>
                            <li>Overall Rubrics Flexibility: {formValues.overallRubricsFlexibility}/4</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">2. Evaluate Rubrics Rationale:</h4>
                          <p className="ml-6">{formValues.evaluateRubricsRationale}</p>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? "Saving..." : "Submit Task 4"}
                      </Button>
                    </div>
                  </TabsContent>
                </form>
              </Form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
