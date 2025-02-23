import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TaskTwoResponse, taskTwoResponseSchema, WorkflowTask } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function parseRubricNames(rubricText: string): string[] {
  try {
    const names: string[] = [];

    // First try to find rubrics sections
    const rubricsRegex = /<rubrics>([\s\S]*?)<\/rubrics>/g;
    let rubricsMatch;

    while ((rubricsMatch = rubricsRegex.exec(rubricText)) !== null) {
      const rubricsContent = rubricsMatch[1];

      // Find name tags within each rubrics section
      const nameRegex = /<name>([\s\S]*?)<\/name>/g;
      let nameMatch;

      while ((nameMatch = nameRegex.exec(rubricsContent)) !== null) {
        const name = nameMatch[1].trim();
        if (name) {
          names.push(name);
        }
      }
    }

    // If no names found through tags, try to parse bullet points
    if (names.length === 0) {
      const lines = rubricText.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (/^[\d\.\-\*•]\s+/.test(trimmed)) {
          const content = trimmed.replace(/^[\d\.\-\*•]\s+/, '').trim();
          if (content) {
            names.push(content);
          }
        }
      }
    }

    console.log("Parsed rubric names:", names);
    return names;
  } catch (error) {
    console.error("Error parsing rubric names:", error);
    return [];
  }
}

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

function RubricItemEvaluation({
  name,
  index,
  form,
}: {
  name: string;
  index: number;
  form: any;
}) {
  return (
    <div className="space-y-6 border-b pb-6 last:border-0">
      <div className="space-y-4">
        <h3 className="font-semibold">Rubric Item {index + 1}: {name}</h3>

        <div className="bg-muted p-4 rounded-lg space-y-4">
          <div>
            <h4 className="font-medium text-sm">Reasoning:</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {/*This section extracts reasoning from the rubric string*/}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm">Grading Guidelines:</h4>
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
              {/*This section extracts grading guidelines from the rubric string*/}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-sm">Item Weight:</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {/*This section extracts item weight from the rubric string*/}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>I. Technical Accuracy</Label>
            <Slider
              min={1}
              max={4}
              step={1}
              defaultValue={[form.getValues(`rubricItems.${index}.technicalAccuracy`) || 1]}
              onValueChange={([v]) => form.setValue(`rubricItems.${index}.technicalAccuracy`, v)}
            />
            <p className="text-sm text-muted-foreground">
              Current value: {form.watch(`rubricItems.${index}.technicalAccuracy`)}
            </p>
          </div>

          <div className="space-y-2">
            <Label>II. Relevance and Necessity</Label>
            <Slider
              min={1}
              max={4}
              step={1}
              defaultValue={[form.getValues(`rubricItems.${index}.relevanceNecessity`) || 1]}
              onValueChange={([v]) => form.setValue(`rubricItems.${index}.relevanceNecessity`, v)}
            />
            <p className="text-sm text-muted-foreground">
              Current value: {form.watch(`rubricItems.${index}.relevanceNecessity`)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label>III. Partial Credit Structure</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`differingAnswers-${index}`}
                  checked={form.watch(`rubricItems.${index}.differingAnswers`)}
                  onCheckedChange={(checked) => form.setValue(`rubricItems.${index}.differingAnswers`, checked)}
                />
                <label htmlFor={`differingAnswers-${index}`} className="text-sm text-muted-foreground">
                  Differs for incorrect answers 1 and 2
                </label>
              </div>
            </div>
            <Slider
              min={1}
              max={4}
              step={1}
              defaultValue={[form.getValues(`rubricItems.${index}.partialCreditStructure`) || 1]}
              onValueChange={([v]) => form.setValue(`rubricItems.${index}.partialCreditStructure`, v)}
            />
            <p className="text-sm text-muted-foreground">
              Current value: {form.watch(`rubricItems.${index}.partialCreditStructure`)}
            </p>
          </div>

          <div className="space-y-2">
            <Label>IV. Weighting</Label>
            <Slider
              min={1}
              max={4}
              step={1}
              defaultValue={[form.getValues(`rubricItems.${index}.weighting`) || 1]}
              onValueChange={([v]) => form.setValue(`rubricItems.${index}.weighting`, v)}
            />
            <p className="text-sm text-muted-foreground">
              Current value: {form.watch(`rubricItems.${index}.weighting`)}
            </p>
          </div>

          <div className="space-y-2">
            <Label>V. Clarity and Objectivity</Label>
            <Slider
              min={1}
              max={4}
              step={1}
              defaultValue={[form.getValues(`rubricItems.${index}.clarityObjectivity`) || 1]}
              onValueChange={([v]) => form.setValue(`rubricItems.${index}.clarityObjectivity`, v)}
            />
            <p className="text-sm text-muted-foreground">
              Current value: {form.watch(`rubricItems.${index}.clarityObjectivity`)}
            </p>
          </div>

          <div className="space-y-2">
            <Label>VI. Differentiation Power</Label>
            <Slider
              min={1}
              max={4}
              step={1}
              defaultValue={[form.getValues(`rubricItems.${index}.differentiationPower`) || 1]}
              onValueChange={([v]) => form.setValue(`rubricItems.${index}.differentiationPower`, v)}
            />
            <p className="text-sm text-muted-foreground">
              Current value: {form.watch(`rubricItems.${index}.differentiationPower`)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RubricItemForm({
  name,
  index,
  form,
  workflow,
  onRemove,
}: {
  name: string;
  index: number;
  form: any;
  workflow: WorkflowTask;
  onRemove?: () => void;
}) {
  if (!workflow.taskZeroInputs) return null;

  return (
    <div className="space-y-6 border-b pb-6 last:border-0">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Rubric Item {index + 1}: {name}</h3>
        {onRemove && (
          <Button variant="destructive" size="sm" onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Score:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <span>Correct answer Score:</span>
            <input
              type="number"
              min="0"
              max="2"
              step="1"
              className="w-20 px-2 py-1 border rounded"
              {...form.register(`rubricItems.${index}.correctScore`, { valueAsNumber: true })}
            />
            <span>points</span>
            <AnswerModal
              title="Correct Answer"
              content={workflow.taskZeroInputs.expert_a_correct}
            />
          </div>
          <div className="flex items-center gap-2">
            <span>Incorrect answer 1 Score:</span>
            <input
              type="number"
              min="0"
              max="2"
              step="1"
              className="w-20 px-2 py-1 border rounded"
              {...form.register(`rubricItems.${index}.incorrectScore1`, { valueAsNumber: true })}
            />
            <span>points</span>
            <AnswerModal
              title="Incorrect Answer 1"
              content={workflow.taskZeroInputs.expert_a_incorrect_1}
            />
          </div>
          <div className="flex items-center gap-2">
            <span>Incorrect answer 2 Score:</span>
            <input
              type="number"
              min="0"
              max="2"
              step="1"
              className="w-20 px-2 py-1 border rounded"
              {...form.register(`rubricItems.${index}.incorrectScore2`, { valueAsNumber: true })}
            />
            <span>points</span>
            <AnswerModal
              title="Incorrect Answer 2"
              content={workflow.taskZeroInputs.expert_a_incorrect_2}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Rationale:</h4>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label>Correct answer:</label>
              <AnswerModal
                title="Correct Answer"
                content={workflow.taskZeroInputs.expert_a_correct}
              />
            </div>
            <Textarea {...form.register(`rubricItems.${index}.correctRationale`)} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label>Incorrect answer 1:</label>
              <AnswerModal
                title="Incorrect Answer 1"
                content={workflow.taskZeroInputs.expert_a_incorrect_1}
              />
            </div>
            <Textarea {...form.register(`rubricItems.${index}.incorrectRationale1`)} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label>Incorrect answer 2:</label>
              <AnswerModal
                title="Incorrect Answer 2"
                content={workflow.taskZeroInputs.expert_a_incorrect_2}
              />
            </div>
            <Textarea {...form.register(`rubricItems.${index}.incorrectRationale2`)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TaskTwo() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: workflow, isLoading, error } = useQuery<WorkflowTask>({
    queryKey: [`/api/workflow/${id}`],
    staleTime: 0, // Always fetch fresh data
    retry: 3, // Retry failed requests
    retryDelay: 1000, // Wait 1 second between retries
    onSuccess: (data) => {
      console.log("Workflow data loaded successfully:", data);
      if (!data?.taskZeroInputs?.expert_a_rubric) {
        console.warn("No rubric data found in workflow");
      }
    },
    onError: (err) => {
      console.error("Error loading workflow data:", err);
    }
  });

  // Save the rubric names for debugging
  const rubricNames = workflow?.taskZeroInputs
    ? parseRubricNames(workflow.taskZeroInputs.expert_a_rubric)
    : [];

  console.log("Task 2 - Workflow Data:", workflow);
  console.log("Task 2 - Expert A Rubric:", workflow?.taskZeroInputs?.expert_a_rubric);
  console.log("Task 2 - Parsed rubric names:", rubricNames);

  // Initialize form with default values
  const savedFormData = typeof window !== 'undefined'
    ? localStorage.getItem(`task-two-${id}`)
    : null;

  const defaultValues = savedFormData
    ? JSON.parse(savedFormData)
    : {
        rubricItems: rubricNames.map((name) => ({
          name,
          correctScore: 0,
          incorrectScore1: 0,
          incorrectScore2: 0,
          correctRationale: "",
          incorrectRationale1: "",
          incorrectRationale2: "",
          technicalAccuracy: 1,
          relevanceNecessity: 1,
          partialCreditStructure: 1,
          differingAnswers: false,
          weighting: 1,
          clarityObjectivity: 1,
          differentiationPower: 1,
        })),
      };

  const form = useForm<TaskTwoResponse>({
    resolver: zodResolver(taskTwoResponseSchema),
    defaultValues,
  });

  const formValues = form.watch();

  const addRubricItem = () => {
    const currentItems = form.getValues().rubricItems || [];
    form.setValue("rubricItems", [
      ...currentItems,
      {
        name: `New Rubric Item ${currentItems.length + 1}`,
        correctScore: 0,
        incorrectScore1: 0,
        incorrectScore2: 0,
        correctRationale: "",
        incorrectRationale1: "",
        incorrectRationale2: "",
        technicalAccuracy: 1,
        relevanceNecessity: 1,
        partialCreditStructure: 1,
        differingAnswers: false,
        weighting: 1,
        clarityObjectivity: 1,
        differentiationPower: 1,
      },
    ]);
  };

  const removeRubricItem = (index: number) => {
    const currentItems = form.getValues().rubricItems || [];
    form.setValue("rubricItems", [
      ...currentItems.slice(0, index),
      ...currentItems.slice(index + 1),
    ]);
  };

  const mutation = useMutation({
    mutationFn: async (data: TaskTwoResponse) => {
      console.log("Submitting Task 2 data:", data);
      const response = await apiRequest("PATCH", `/api/workflow/${id}/task-two`, data);
      console.log("Task 2 submission response:", response);
      // Persist form data to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`task-two-${id}`, JSON.stringify(data));
      }
      return response;
    },
    onSuccess: () => {
      console.log("Task 2 submission successful");
      toast({
        title: "Success",
        description: "Task 2 responses saved. Moving to Task 3...",
      });
      setTimeout(() => {
        setLocation(`/task-three/${id}`);
      }, 1000);
    },
    onError: (error) => {
      console.error("Task 2 submission error:", error);
      toast({
        title: "Error",
        description: "Failed to save responses. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: TaskTwoResponse) => {
    console.log("Form submitted with data:", data);
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  if (isLoading || !workflow) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading workflow: {error.message}</div>;
  }

  if (!workflow.taskZeroInputs) {
    return <div>Error: Task Zero inputs not found</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Task 2: Grading Solutions based on the Rubric</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="step1">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="step1">Step 1: Grading Solutions</TabsTrigger>
                <TabsTrigger value="step2">Step 2: Rubric Evaluation</TabsTrigger>
                <TabsTrigger value="step3">Step 3: Review and Submit</TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <TabsContent value="step1">
                    <div className="space-y-8">
                      {formValues.rubricItems.map((item, index) => (
                        <RubricItemForm
                          key={index}
                          name={item.name}
                          index={index}
                          form={form}
                          workflow={workflow}
                          onRemove={index >= rubricNames.length ? () => removeRubricItem(index) : undefined}
                        />
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={addRubricItem}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Rubric Item
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="step2">
                    <div className="space-y-8">
                      {formValues.rubricItems.map((item, index) => (
                        <RubricItemEvaluation
                          key={index}
                          name={item.name}
                          index={index}
                          form={form}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="step3">
                    <div className="space-y-6">
                      <h3 className="font-semibold">Review and Submit</h3>
                      <div className="bg-muted p-4 rounded-lg space-y-6">
                        <div>
                          <h4 className="font-semibold mb-4">Step 1: Grading Solutions Using the Rubric</h4>
                          {formValues.rubricItems.map((item, index) => (
                            <div key={index} className="mb-6">
                              <h5 className="font-medium">Rubric Item {index + 1}: {item.name}</h5>
                              <div className="ml-4">
                                <p className="font-medium mt-2">Score:</p>
                                <ul className="list-disc ml-6">
                                  <li>Correct answer Score: {item.correctScore} points</li>
                                  <li>Incorrect answer 1 Score: {item.incorrectScore1} points</li>
                                  <li>Incorrect answer 2 Score: {item.incorrectScore2} points</li>
                                </ul>

                                <p className="font-medium mt-2">Rationale:</p>
                                <ul className="list-disc ml-6">
                                  <li>Correct answer: {item.correctRationale}</li>
                                  <li>Incorrect answer 1: {item.incorrectRationale1}</li>
                                  <li>Incorrect answer 2: {item.incorrectRationale2}</li>
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div>
                          <h4 className="font-semibold mb-4">Step 2: Rubric Evaluation (1-4)</h4>
                          {formValues.rubricItems.map((item, index) => (
                            <div key={index} className="mb-6">
                              <h5 className="font-medium">Rubric Item {index + 1}: {item.name}</h5>
                              <div className="ml-4">
                                <ul className="list-disc ml-6">
                                  <li>I. Technical Accuracy: {item.technicalAccuracy}</li>
                                  <li>II. Relevance and Necessity: {item.relevanceNecessity}</li>
                                  <li>
                                    III. Partial Credit Structure: {item.partialCreditStructure}
                                    {item.differingAnswers && " (differs for incorrect answers 1 and 2)"}
                                  </li>
                                  <li>IV. Weighting: {item.weighting}</li>
                                  <li>V. Clarity and Objectivity: {item.clarityObjectivity}</li>
                                  <li>VI. Differentiation Power: {item.differentiationPower}</li>
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? "Saving..." : "Submit Task 2"}
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