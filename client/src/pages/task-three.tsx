import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TaskThreeResponse, taskThreeResponseSchema, WorkflowTask } from "@shared/schema";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye } from "lucide-react";

function AnswerModal({ title, content }: { title: string; content: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TaskThree() {
  const { id } = useParams();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: workflow, isLoading } = useQuery<WorkflowTask>({
    queryKey: [`/api/workflow/${id}`],
  });

  const form = useForm<TaskThreeResponse>({
    resolver: zodResolver(taskThreeResponseSchema),
    defaultValues: {
      correctAnswerGrade: 0,
      correctAnswerRationale: "",
      incorrectAnswer1Grade: 0,
      incorrectAnswer1Rationale: "",
      incorrectAnswer2Grade: 0,
      incorrectAnswer2Rationale: "",
    },
  });

  const formValues = form.watch();

  const mutation = useMutation({
    mutationFn: async (data: TaskThreeResponse) => {
      await apiRequest("PATCH", `/api/workflow/${id}/task-three`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task 3 responses saved. Moving to Task 4...",
      });
      setTimeout(() => {
        setLocation(`/task-four/${id}`);
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save responses",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !workflow) {
    return <div>Loading...</div>;
  }

  if (!workflow.taskZeroInputs) {
    return <div>Error: Task Zero inputs not found</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Task 3: Evaluate Model Grading (Rubric test)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Instructions for Comparing and Assessing Rubric Test:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Compare any disagreements between your grading and the model grading</li>
                <li>Note: This evaluates grading quality, NOT quality of the rubrics themselves</li>
                <li>Rate how much you agree with: "The model grading applies the rubric correctly, including partial credit"</li>
                <li>Rating scale: 1 = Strongly Disagree, 4 = Strongly Agree</li>
                <li>Provide a 1-2 sentence explanation for your assessment, including any potential issues in rubric interpretation by the model</li>
              </ul>
            </div>
            <Tabs defaultValue="step1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="step1">Step 1: Evaluate Model Grading</TabsTrigger>
                <TabsTrigger value="step2">Step 2: Review and Submit</TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
                  <TabsContent value="step1">
                    <div className="space-y-8">
                      {/* Correct Answer */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">Rubric Test for Correct answer:</h3>
                          <AnswerModal
                            title="Correct Answer Rubric Test"
                            content={workflow.taskZeroInputs.expert_a_correct_rubric_test}
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Evaluate model grading</Label>
                            <Slider
                              min={0}
                              max={4}
                              step={1}
                              defaultValue={[formValues.correctAnswerGrade]}
                              onValueChange={([v]) => form.setValue("correctAnswerGrade", v)}
                            />
                            <p className="text-sm text-muted-foreground">
                              Current value: {formValues.correctAnswerGrade}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>Evaluate model grading rationale</Label>
                            <Textarea {...form.register("correctAnswerRationale")} />
                          </div>
                        </div>
                      </div>

                      {/* Incorrect Answer 1 */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">Rubric Test for Incorrect answer 1:</h3>
                          <AnswerModal
                            title="Incorrect Answer 1 Rubric Test"
                            content={workflow.taskZeroInputs.expert_a_incorrect_1_rubric_test}
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Evaluate model grading</Label>
                            <Slider
                              min={0}
                              max={4}
                              step={1}
                              defaultValue={[formValues.incorrectAnswer1Grade]}
                              onValueChange={([v]) => form.setValue("incorrectAnswer1Grade", v)}
                            />
                            <p className="text-sm text-muted-foreground">
                              Current value: {formValues.incorrectAnswer1Grade}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>Evaluate model grading rationale</Label>
                            <Textarea {...form.register("incorrectAnswer1Rationale")} />
                          </div>
                        </div>
                      </div>

                      {/* Incorrect Answer 2 */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">Rubric Test for Incorrect answer 2:</h3>
                          <AnswerModal
                            title="Incorrect Answer 2 Rubric Test"
                            content={workflow.taskZeroInputs.expert_a_incorrect_2_rubric_test}
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Evaluate model grading</Label>
                            <Slider
                              min={0}
                              max={4}
                              step={1}
                              defaultValue={[formValues.incorrectAnswer2Grade]}
                              onValueChange={([v]) => form.setValue("incorrectAnswer2Grade", v)}
                            />
                            <p className="text-sm text-muted-foreground">
                              Current value: {formValues.incorrectAnswer2Grade}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>Evaluate model grading rationale</Label>
                            <Textarea {...form.register("incorrectAnswer2Rationale")} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="step2">
                    <div className="space-y-6">
                      <h3 className="font-semibold">Review and Submit</h3>
                      <div className="bg-muted p-4 rounded-lg space-y-6">
                        <div>
                          <h4 className="font-medium mb-4">Step 1: Evaluate Model Grading (Rubric test)</h4>
                          <div className="space-y-6">
                            <div>
                              <h5 className="font-medium">Correct answer:</h5>
                              <ul className="list-disc ml-6">
                                <li>Evaluate model grading: {formValues.correctAnswerGrade}/4</li>
                                <li>Evaluate model grading rationale: {formValues.correctAnswerRationale}</li>
                              </ul>
                            </div>

                            <div>
                              <h5 className="font-medium">Incorrect answer 1:</h5>
                              <ul className="list-disc ml-6">
                                <li>Evaluate model grading: {formValues.incorrectAnswer1Grade}/4</li>
                                <li>Evaluate model grading rationale: {formValues.incorrectAnswer1Rationale}</li>
                              </ul>
                            </div>

                            <div>
                              <h5 className="font-medium">Incorrect answer 2:</h5>
                              <ul className="list-disc ml-6">
                                <li>Evaluate model grading: {formValues.incorrectAnswer2Grade}/4</li>
                                <li>Evaluate model grading rationale: {formValues.incorrectAnswer2Rationale}</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? "Saving..." : "Submit Task 3"}
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