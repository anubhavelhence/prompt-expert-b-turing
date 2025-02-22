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
import { useEffect } from "react";
import { AnswerModal } from "@/components/AnswerModal";

export default function TaskOne() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: workflow, isLoading } = useQuery<WorkflowTask>({
    queryKey: [`/api/workflow/${id}`],
  });

  const savedFormData = typeof window !== 'undefined'
    ? localStorage.getItem(`task-one-${id}`)
    : null;

  const defaultValues = savedFormData
    ? JSON.parse(savedFormData)
    : {
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
      };

  const form = useForm<TaskOneResponse>({
    resolver: zodResolver(taskOneResponseSchema),
    defaultValues,
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
        description: "Task 1 responses saved. Moving to Task 2...",
      });
      setTimeout(() => {
        setLocation(`/task-two/${id}`);
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

  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(`task-one-${id}`, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form, id]);

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
              <p className="mt-2">Domain:</p>
              <p>{workflow.taskZeroInputs.expert_a_domain}</p>

              <p className="mt-2">Subdomain:</p>
              <p>{workflow.taskZeroInputs.expert_a_subdomain}</p>

              <p className="mt-2">Difficulty Score:</p>
              <p>{workflow.taskZeroInputs.expert_a_difficulty_score}</p>

              <p className="mt-2">Problem Statement:</p>
              <p>{workflow.taskZeroInputs.expert_a_problem}</p>

              <p className="mt-4 font-semibold">Your task is to evaluate the question based on the following criteria:</p>

              <div className="mt-4 space-y-2">
                <p>1. Formatting: Is the format of the question correct?</p>
                <p>2. Originality: Is this question original material?</p>
                <p>3. Difficulty: Is this question difficult enough?</p>
                <p>4. Information Dependencies: Does this question require information that is not included in the prompt and could not easily be found on the internet?</p>
                <p>5. Temporal Retrieval: Does this question require information based on events past April 2024?</p>
                <p>6. Expert-level Reasoning: Does this question require expert-level reasoning and intelligence?</p>
                <p>7. Outcome-based: Is the question presented in a way that there is likely an objectively correct, gradable answer (or a finite number of plausibly correct answers) that multiple domain experts could agree on?</p>
              </div>

              <h2 className="text-xl font-bold mt-6">Instructions for Evaluation</h2>
              <p className="mt-2">Follow these steps to evaluate the question:</p>

              <ol className="list-decimal list-inside mt-4 space-y-2">
                <li>Carefully read the problem statement and associated details.</li>
                <li>For each criterion, provide a detailed assessment inside <span className="font-mono">&lt;criterion_analysis&gt;</span> tags.</li>
                <li>Provide specific feedback and suggestions for improvement if needed.</li>
                <li>Use the following format for each criterion evaluation:</li>
              </ol>

              <div className="mt-4 space-y-2">
                <p className="font-semibold">Evaluation Format:</p>


                    &lt;evaluation&gt;

                    &lt;criterion&gt;Criterion Name&lt;/criterion&gt;
                    &lt;assessment&gt;Your assessment of whether the question meets this criterion&lt;/assessment&gt;
                    &lt;feedback&gt;Specific feedback and suggestions for improvement, if needed&lt;/feedback&gt;
                    &lt;/evaluation&gt;


              </div>

              <h2 className="text-xl font-bold mt-6">Final Assessment</h2>
              <p className="mt-2">After evaluating all criteria, provide the following details:</p>

              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>A difficulty rating (1-5) based on the following guidance:</li>
                <ul className="list-disc list-inside ml-6 space-y-1">
                  <li>1: Challenging but straightforward for a strong field student</li>
                  <li>5: Extremely difficult even for subfield experts</li>
                </ul>
                <li>Your assessment of the appropriate domain and subdomain for this question, which may differ from the provided information.</li>
              </ul>

              <div className="bg-muted p-4 rounded-lg mt-4">
                <p className="font-semibold">Final Assessment Format:</p>
                    &lt;final_assessment&gt;
                    &lt;difficulty_rating&gt;Your assigned difficulty rating (1-5)&lt;/difficulty_rating&gt;
                    &lt;assigned_domain&gt;Your assigned domain&lt;/assigned_domain&gt;
                    &lt;assigned_subdomain&gt;Your assigned subdomain&lt;/assigned_subdomain&gt;
                    &lt;overall_quality&gt;Your overall assessment of the question's quality and suitability&lt;/overall_quality&gt;
                    &lt;improvement_suggestions&gt;Any additional suggestions for improving the question&lt;/improvement_suggestions&gt;
                    &lt;/final_assessment&gt;
              </div>

              <h2 className="text-xl font-bold mt-6">Evaluation Guidelines</h2>
              <p className="mt-2">Consider the following guidelines when evaluating:</p>

              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Questions should focus on evaluating reasoning and intelligence over factual knowledge.</li>
                <li>They should require multi-step reasoning and deep thinking.</li>
                <li>Questions should not be easily answerable without specific domain expertise.</li>
                <li>They should be novel and unlikely to be rote problems for models.</li>
                <li>Ensure questions can't be answered with simple fact retrieval.</li>
                <li>The target difficulty level should be such that an average Doctorate-level student or equivalent (8+ years professional experience) would score 60-80%.</li>
                <li>Questions should be challenging enough that current state-of-the-art models get &lt;15% correct 0-shot.</li>
                <li>All content should be original and not in the public domain.</li>
              </ul>

              <p className="mt-4">Begin your evaluation now, starting with your analysis for the first criterion.</p>

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
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Correct Answer</h4>
                          <AnswerModal
                            title="Correct Answer"
                            content={workflow.taskZeroInputs.expert_a_correct}
                          />
                        </div>
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
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Incorrect Answer 1</h4>
                          <AnswerModal
                            title="Incorrect Answer 1"
                            content={workflow.taskZeroInputs.expert_a_incorrect_1}
                          />
                        </div>
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
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Incorrect Answer 2</h4>
                          <AnswerModal
                            title="Incorrect Answer 2"
                            content={workflow.taskZeroInputs.expert_a_incorrect_2}
                          />
                        </div>
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