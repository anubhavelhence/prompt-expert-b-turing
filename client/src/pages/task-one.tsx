import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TaskOneResponse, taskOneResponseSchema, WorkflowTask } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function TaskOne() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: workflow, isLoading } = useQuery<WorkflowTask>({
    queryKey: [`/api/workflow/${id}`],
  });

  const form = useForm<TaskOneResponse>({
    resolver: zodResolver(taskOneResponseSchema),
    defaultValues: {
      metadataQuality: 1,
      domainCorrect: true,
      subdomainCorrect: true,
      difficultyScore: 1,
      quality: "",
      suggestions: "",
      correctAnswerGrade: 0,
      correctAnswerRationale: "",
      incorrectAnswer1Grade: 0,
      incorrectAnswer1Rationale: "",
      incorrectAnswer2Grade: 0,
      incorrectAnswer2Rationale: "",
    },
  });

  // Watch form values for live updates
  const formValues = form.watch();

  const mutation = useMutation({
    mutationFn: async (data: TaskOneResponse) => {
      await apiRequest("PATCH", `/api/workflow/${id}/task-one`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task 1 responses saved",
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
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Panel */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Task Information</h2>
            <p className="mb-4">Run this prompt and based on output answer the following question:</p>
            <div className="bg-muted p-4 rounded-lg">
              <p>You are an expert evaluator tasked with assessing the quality of proposed questions for testing Large Language Models (LLMs). Your evaluation is crucial for ensuring that these questions meet the required standards for difficulty, originality, and expert-level reasoning. Your assessment will contribute to the advancement of AI evaluation techniques.</p>
              <p className="mt-4">Here are the details of the proposed question:</p>
              <p className="mt-2">Domain: {workflow.taskZeroInputs.expert_a_domain}</p>
              <p className="mt-2">Problem Statement:</p>
              <p>{workflow.taskZeroInputs.expert_a_problem}</p>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="step1">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="step1">Step 1</TabsTrigger>
                <TabsTrigger value="step2">Step 2</TabsTrigger>
                <TabsTrigger value="step3">Step 3</TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
                  <TabsContent value="step1">
                    <h3 className="font-semibold mb-4">Metadata Quality Check</h3>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Domain</Label>
                        <RadioGroup 
                          onValueChange={(v) => form.setValue("domainCorrect", v === "correct")}
                          defaultValue={formValues.domainCorrect ? "correct" : "needs-improvement"}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="correct" id="domain-correct" />
                            <Label htmlFor="domain-correct">Correct</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="needs-improvement" id="domain-improve" />
                            <Label htmlFor="domain-improve">Needs Improvement</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Subdomain</Label>
                        <RadioGroup 
                          onValueChange={(v) => form.setValue("subdomainCorrect", v === "correct")}
                          defaultValue={formValues.subdomainCorrect ? "correct" : "needs-improvement"}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="correct" id="subdomain-correct" />
                            <Label htmlFor="subdomain-correct">Correct</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="needs-improvement" id="subdomain-improve" />
                            <Label htmlFor="subdomain-improve">Needs Improvement</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Difficulty Score (1-5)</Label>
                        <Slider 
                          min={1} 
                          max={5} 
                          step={1}
                          defaultValue={[formValues.difficultyScore]}
                          onValueChange={([v]) => form.setValue("difficultyScore", v)}
                        />
                        <p className="text-sm text-muted-foreground">Current value: {formValues.difficultyScore}</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Quality</Label>
                        <Textarea {...form.register("quality")} />
                      </div>

                      <div className="space-y-2">
                        <Label>Suggestions</Label>
                        <Textarea {...form.register("suggestions")} />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="step2">
                    <h3 className="font-semibold mb-4">Grade the Solutions</h3>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Correct Answer</h4>
                        <div className="space-y-2">
                          <Label>Grade (0-1)</Label>
                          <Slider 
                            min={0} 
                            max={1} 
                            step={0.1}
                            defaultValue={[formValues.correctAnswerGrade]}
                            onValueChange={([v]) => form.setValue("correctAnswerGrade", v)}
                          />
                          <p className="text-sm text-muted-foreground">Current value: {formValues.correctAnswerGrade}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Rationale</Label>
                          <Textarea {...form.register("correctAnswerRationale")} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Incorrect Answer 1</h4>
                        <div className="space-y-2">
                          <Label>Grade (0-1)</Label>
                          <Slider 
                            min={0} 
                            max={1} 
                            step={0.1}
                            defaultValue={[formValues.incorrectAnswer1Grade]}
                            onValueChange={([v]) => form.setValue("incorrectAnswer1Grade", v)}
                          />
                          <p className="text-sm text-muted-foreground">Current value: {formValues.incorrectAnswer1Grade}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Rationale</Label>
                          <Textarea {...form.register("incorrectAnswer1Rationale")} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Incorrect Answer 2</h4>
                        <div className="space-y-2">
                          <Label>Grade (0-1)</Label>
                          <Slider 
                            min={0} 
                            max={1} 
                            step={0.1}
                            defaultValue={[formValues.incorrectAnswer2Grade]}
                            onValueChange={([v]) => form.setValue("incorrectAnswer2Grade", v)}
                          />
                          <p className="text-sm text-muted-foreground">Current value: {formValues.incorrectAnswer2Grade}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Rationale</Label>
                          <Textarea {...form.register("incorrectAnswer2Rationale")} />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="step3">
                    <div className="space-y-6">
                      <h3 className="font-semibold">Review and Submit</h3>

                      <div className="bg-muted p-4 rounded-lg space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Step 1: Review Problem and Metadata</h4>
                          <div className="ml-4 space-y-2">
                            <p>Metadata Quality Check:</p>
                            <ul className="ml-4 space-y-1">
                              <li>Domain: {formValues.domainCorrect ? "correct" : "needs improvement"}</li>
                              <li>Subdomain: {formValues.subdomainCorrect ? "correct" : "needs improvement"}</li>
                              <li>Rating: {formValues.difficultyScore}</li>
                              <li>Quality: {formValues.quality}</li>
                            </ul>
                            <p>Suggestions: {formValues.suggestions}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Step 2 and 3: Grading the Solutions</h4>
                          <div className="ml-4 space-y-4">
                            <div>
                              <p className="font-medium">1. Correct answer:</p>
                              <ul className="ml-4">
                                <li>Grade: {formValues.correctAnswerGrade}/1</li>
                                <li>Rationale: {formValues.correctAnswerRationale}</li>
                              </ul>
                            </div>
                            <div>
                              <p className="font-medium">2. Incorrect answer 1:</p>
                              <ul className="ml-4">
                                <li>Grade: {formValues.incorrectAnswer1Grade}/1</li>
                                <li>Rationale: {formValues.incorrectAnswer1Rationale}</li>
                              </ul>
                            </div>
                            <div>
                              <p className="font-medium">3. Incorrect answer 2:</p>
                              <ul className="ml-4">
                                <li>Grade: {formValues.incorrectAnswer2Grade}/1</li>
                                <li>Rationale: {formValues.incorrectAnswer2Rationale}</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Summary of Grading Results:</h4>
                          <ul className="ml-4">
                            <li>human_grade_reference (correct answer): {formValues.correctAnswerGrade}/1</li>
                            <li>human_grade_candidate (incorrect answer 1): {formValues.incorrectAnswer1Grade}/1</li>
                            <li>human_grade_candidate (incorrect answer 2): {formValues.incorrectAnswer2Grade}/1</li>
                          </ul>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? "Saving..." : "Submit Task 1"}
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