import { useParams } from "wouter";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

function parseRubricNames(rubricText: string): string[] {
  const names: string[] = [];
  const nameRegex = /<name>(.*?)<\/name>/g;
  let match;

  while ((match = nameRegex.exec(rubricText)) !== null) {
    names.push(match[1].trim());
  }

  return names;
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

function RubricItemForm({ 
  name,
  index,
  form,
  workflow,
  onRemove
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
  const { toast } = useToast();

  const { data: workflow, isLoading } = useQuery<WorkflowTask>({
    queryKey: [`/api/workflow/${id}`],
  });

  const rubricNames = workflow?.taskZeroInputs 
    ? parseRubricNames(workflow.taskZeroInputs.expert_a_rubric)
    : [];

  const defaultValues = {
    rubricItems: rubricNames.map(name => ({
      name,
      correctScore: 0,
      incorrectScore1: 0,
      incorrectScore2: 0,
      correctRationale: "",
      incorrectRationale1: "",
      incorrectRationale2: "",
    }))
  };

  const form = useForm<TaskTwoResponse>({
    resolver: zodResolver(taskTwoResponseSchema),
    defaultValues,
  });

  // Watch form values for live updates
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
      }
    ]);
  };

  const removeRubricItem = (index: number) => {
    const currentItems = form.getValues().rubricItems || [];
    form.setValue("rubricItems", [
      ...currentItems.slice(0, index),
      ...currentItems.slice(index + 1)
    ]);
  };

  const mutation = useMutation({
    mutationFn: async (data: TaskTwoResponse) => {
      await apiRequest("PATCH", `/api/workflow/${id}/task-two`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task 2 responses saved",
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
            <CardTitle>Task 2: Grading Solutions based on the Rubric</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="step1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="step1">Step 1: Grading Solutions</TabsTrigger>
                <TabsTrigger value="step2">Step 2: Review and Submit</TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
                  <TabsContent value="step1">
                    <div className="space-y-8">
                      {formValues.rubricItems.map((item, index) => (
                        <RubricItemForm
                          key={index}
                          name={item.name}
                          index={index}
                          form={form}
                          workflow={workflow}
                          onRemove={
                            // Only allow removing manually added items
                            index >= rubricNames.length ? () => removeRubricItem(index) : undefined
                          }
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
                    <div className="space-y-6">
                      <h3 className="font-semibold">Review and Submit</h3>
                      <div className="bg-muted p-4 rounded-lg space-y-6">
                        {formValues.rubricItems.map((item, index) => (
                          <div key={index} className="space-y-4">
                            <h4 className="font-medium">Rubric Item {index + 1}: {item.name}</h4>
                            <div className="ml-4">
                              <h5 className="font-medium">Score:</h5>
                              <ul className="ml-4 space-y-1">
                                <li>Correct answer Score: {item.correctScore} points</li>
                                <li>Incorrect answer 1 Score: {item.incorrectScore1} points</li>
                                <li>Incorrect answer 2 Score: {item.incorrectScore2} points</li>
                              </ul>

                              <h5 className="font-medium mt-4">Rationale:</h5>
                              <ul className="ml-4 space-y-2">
                                <li>
                                  <span className="font-medium">Correct answer:</span>
                                  <p className="mt-1">{item.correctRationale}</p>
                                </li>
                                <li>
                                  <span className="font-medium">Incorrect answer 1:</span>
                                  <p className="mt-1">{item.incorrectRationale1}</p>
                                </li>
                                <li>
                                  <span className="font-medium">Incorrect answer 2:</span>
                                  <p className="mt-1">{item.incorrectRationale2}</p>
                                </li>
                              </ul>
                            </div>
                          </div>
                        ))}
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