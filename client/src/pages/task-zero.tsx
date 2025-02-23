import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TaskZeroInputs, taskZeroSchema } from "@shared/schema";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { downloadTaskZero } from "@/lib/docx-utils";

function parseRubrics(rubricText: string) {
  // Split by newlines and filter empty lines
  const lines = rubricText.split('\n').filter(line => line.trim());
  const rubrics = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Look for lines that could be rubric headers (e.g., "1.", "Rubric 1:", etc.)
    if (line.match(/^\d+[\.):]|^rubric\s+\d+[:]/i)) {
      const name = line;
      const description = lines[i + 1]?.trim() || '';
      rubrics.push({ name, description });
    }
  }

  console.log("Parsed rubric names:", rubrics);
  return rubrics;
}

export default function TaskZero() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const savedFormData = typeof window !== 'undefined'
    ? localStorage.getItem('task-zero-form')
    : null;

  const form = useForm<TaskZeroInputs>({
    resolver: zodResolver(taskZeroSchema),
    defaultValues: savedFormData
      ? JSON.parse(savedFormData)
      : {
          expert_a_domain: "",
          expert_a_subdomain: "",
          expert_a_difficulty_score: 1,
          expert_a_problem: "",
          expert_a_rubric: "",
          expert_a_incorrect_1: "",
          expert_a_incorrect_2: "",
          expert_a_correct: "",
          expert_a_incorrect_1_rubric_test: "",
          expert_a_incorrect_2_rubric_test: "",
          expert_a_correct_rubric_test: "",
        },
  });

  // Watch the rubric field for changes
  const rubric = form.watch("expert_a_rubric");
  console.log("Expert A Rubric:", rubric);

  // Parse rubrics whenever the rubric field changes
  const rubricItems = parseRubrics(rubric);

  const mutation = useMutation({
    mutationFn: async (data: TaskZeroInputs) => {
      const res = await apiRequest("POST", "/api/workflow", data);
      return res.json();
    },
    onSuccess: async (data) => {
      // Download the submission as docx
      await downloadTaskZero(form.getValues());

      toast({
        title: "Task 0 completed",
        description: "Moving to Task 1",
      });
      setLocation(`/task-one/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save Task 0 data",
        variant: "destructive",
      });
    },
  });

  // Save form data to localStorage whenever it changes
  form.watch((value) => {
    localStorage.setItem('task-zero-form', JSON.stringify(value));
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Task 0: Initial Information from Expert A Question</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label>Domain</label>
                  <Input {...form.register("expert_a_domain")} />
                </div>
                <div className="space-y-2">
                  <label>Subdomain</label>
                  <Input {...form.register("expert_a_subdomain")} />
                </div>
              </div>

              <div className="space-y-2">
                <label>Difficulty Score (1-5)</label>
                <Input 
                  type="number" 
                  min={1} 
                  max={5}
                  {...form.register("expert_a_difficulty_score", { valueAsNumber: true })} 
                />
              </div>

              <div className="space-y-2">
                <label>Problem</label>
                <Textarea {...form.register("expert_a_problem")} />
              </div>

              <div className="space-y-2">
                <label>Rubric</label>
                <Textarea {...form.register("expert_a_rubric")} className="min-h-[200px]" />
                {rubricItems.length > 0 && (
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Parsed Rubric Items:</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {rubricItems.map((item, index) => (
                        <li key={index}>
                          <span className="font-medium">{item.name}</span>
                          {item.description && (
                            <p className="ml-6 text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label>Incorrect Answer 1</label>
                <Textarea {...form.register("expert_a_incorrect_1")} />
              </div>

              <div className="space-y-2">
                <label>Incorrect Answer 2</label>
                <Textarea {...form.register("expert_a_incorrect_2")} />
              </div>

              <div className="space-y-2">
                <label>Correct Answer</label>
                <Textarea {...form.register("expert_a_correct")} />
              </div>

              <div className="space-y-2">
                <label>Incorrect 1 Rubric Test</label>
                <Textarea {...form.register("expert_a_incorrect_1_rubric_test")} />
              </div>

              <div className="space-y-2">
                <label>Incorrect 2 Rubric Test</label>
                <Textarea {...form.register("expert_a_incorrect_2_rubric_test")} />
              </div>

              <div className="space-y-2">
                <label>Correct Rubric Test</label>
                <Textarea {...form.register("expert_a_correct_rubric_test")} />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Continue to Task 1"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}